#!/usr/bin/env python3
import time
import requests
import logging
import re
import platform
from datetime import datetime

# Imports conditionnels
try:
    from pysnmp.hlapi import *
    SNMP_AVAILABLE = True
except Exception:
    SNMP_AVAILABLE = False

try:
    import wmi
    import pythoncom
    WMI_AVAILABLE = True
except Exception:
    WMI_AVAILABLE = False

# InfluxDB client (optionnel si le paquet manquant)
try:
    from influxdb_client import InfluxDBClient, Point, WritePrecision
    from influxdb_client.client.write_api import SYNCHRONOUS
    INFLUX_AVAILABLE = True
except Exception:
    INFLUX_AVAILABLE = False

# ==============================
# CONFIGURATION (modifiable)
# ==============================
BACKEND_URL = "http://192.168.50.1:8000"
LOGIN_ENDPOINT = "/api/users/login"
INCIDENT_ENDPOINT = "/api/incidents"

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin"

CHECK_INTERVAL = 10
COOLDOWN_SECONDS = 300

THRESHOLD_CPU = 80
THRESHOLD_RAM = 85
THRESHOLD_DISK = 90

# Influx settings (assure-toi que token/org/bucket correspondent à ton Influx)
INFLUX_URL = "http://localhost:8086"         # ou http://influxdb:8086 si agent dans un conteneur docker réseau compose
INFLUX_TOKEN = "supersecrettoken"            # token créé / configuré (voir docker-compose)
INFLUX_ORG = "gpit"
INFLUX_BUCKET = "metrics"

# ==============================
# LOGGING
# ==============================
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s'
)
logger = logging.getLogger("AgentHybride")

# ==============================
# GLOBALS
# ==============================
auth_token = None
sent_incidents = {}

# Influx client initialisé plus bas
influx_client = None
write_api = None

# ==============================
# UTILS
# ==============================
def is_valid_ip(ip):
    if not ip:
        return False
    pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    if re.match(pattern, str(ip)):
        parts = str(ip).split('.')
        return all(0 <= int(part) <= 255 for part in parts)
    return False

def is_localhost(ip):
    return ip in ["localhost", "127.0.0.1", "::1"]

# ==============================
# AUTHENTIFICATION
# ==============================
def authenticate():
    global auth_token
    try:
        resp = requests.post(
            f"{BACKEND_URL}{LOGIN_ENDPOINT}",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=5
        )
        if resp.status_code == 200:
            auth_token = resp.json().get("token")
            logger.info("✅ Authentification réussie")
            return True
        else:
            logger.error(f"❌ Échec authentification: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Authentification échouée: {e}")
        return False

def get_headers():
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    return headers

# ==============================
# WMI FUNCTIONS (WINDOWS)
# ==============================
def get_windows_metrics_local():
    if not WMI_AVAILABLE:
        return None

    metrics = {"cpu": None, "ram": None, "disk": None}

    try:
        pythoncom.CoInitialize()
        c = wmi.WMI()

        try:
            cpu_info = c.Win32_Processor()[0]
            metrics["cpu"] = float(cpu_info.LoadPercentage)
        except Exception:
            pass

        try:
            os_info = c.Win32_OperatingSystem()[0]
            total_mem = float(os_info.TotalVisibleMemorySize)
            free_mem = float(os_info.FreePhysicalMemory)
            metrics["ram"] = ((total_mem - free_mem) / total_mem) * 100
        except Exception:
            pass

        try:
            disk = c.Win32_LogicalDisk(DeviceID="C:")[0]
            total_disk = float(disk.Size)
            free_disk = float(disk.FreeSpace)
            metrics["disk"] = ((total_disk - free_disk) / total_disk) * 100
        except Exception:
            pass

        pythoncom.CoUninitialize()
        return metrics
    except Exception as e:
        logger.debug(f"Erreur WMI local: {e}")
        try:
            pythoncom.CoUninitialize()
        except Exception:
            pass
        return None

def get_windows_metrics_remote(ip, username=None, password=None):
    if not WMI_AVAILABLE:
        return None

    metrics = {"cpu": None, "ram": None, "disk": None}

    try:
        pythoncom.CoInitialize()

        if username and password:
            c = wmi.WMI(computer=ip, user=username, password=password)
        else:
            c = wmi.WMI(computer=ip)

        try:
            cpu_info = c.Win32_Processor()[0]
            metrics["cpu"] = float(cpu_info.LoadPercentage)
        except Exception:
            pass

        try:
            os_info = c.Win32_OperatingSystem()[0]
            total_mem = float(os_info.TotalVisibleMemorySize)
            free_mem = float(os_info.FreePhysicalMemory)
            metrics["ram"] = ((total_mem - free_mem) / total_mem) * 100
        except Exception:
            pass

        try:
            disk = c.Win32_LogicalDisk(DeviceID="C:")[0]
            total_disk = float(disk.Size)
            free_disk = float(disk.FreeSpace)
            metrics["disk"] = ((total_disk - free_disk) / total_disk) * 100
        except Exception:
            pass

        pythoncom.CoUninitialize()
        return metrics
    except Exception as e:
        logger.debug(f"Erreur WMI distant {ip}: {e}")
        try:
            pythoncom.CoUninitialize()
        except Exception:
            pass
        return None

# ==============================
# SNMP FUNCTIONS (LINUX)
# ==============================
def snmp_get(ip, oid, community="public", port=161):
    if not SNMP_AVAILABLE:
        return None

    try:
        iterator = getCmd(
            SnmpEngine(),
            CommunityData(community, mpModel=1),
            UdpTransportTarget((ip, port), timeout=2, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(oid))
        )

        errorIndication, errorStatus, errorIndex, varBinds = next(iterator)

        if errorIndication or errorStatus:
            return None

        for varBind in varBinds:
            try:
                return float(varBind[1])
            except:
                return None
    except Exception:
        return None

def get_linux_metrics(ip):
    if not SNMP_AVAILABLE:
        return None

    metrics = {"cpu": None, "ram": None, "disk": None}

    test = snmp_get(ip, '1.3.6.1.2.1.1.1.0')
    if test is None:
        return None

    cpu_idle = snmp_get(ip, '1.3.6.1.4.1.2021.11.11.0')
    if cpu_idle is not None:
        metrics["cpu"] = 100 - cpu_idle

    ram_total = snmp_get(ip, '1.3.6.1.4.1.2021.4.5.0')
    ram_avail = snmp_get(ip, '1.3.6.1.4.1.2021.4.6.0')
    if ram_total and ram_avail and ram_total > 0:
        metrics["ram"] = ((ram_total - ram_avail) / ram_total) * 100

    disk = snmp_get(ip, '1.3.6.1.4.1.2021.9.1.9.1')
    if disk is not None:
        metrics["disk"] = disk

    return metrics

# ==============================
# UNIVERSAL GET METRICS
# ==============================
def get_metrics(ip):
    if is_localhost(ip) and platform.system() == "Windows":
        return get_windows_metrics_local()

    if WMI_AVAILABLE:
        metrics = get_windows_metrics_remote(ip)
        if metrics and any(v is not None for v in metrics.values()):
            return metrics

    if SNMP_AVAILABLE:
        metrics = get_linux_metrics(ip)
        if metrics and any(v is not None for v in metrics.values()):
            return metrics

    return None

# ==============================
# INCIDENT
# ==============================
def send_incident(machine, res, val, th):
    if not auth_token:
        if not authenticate():
            return

    name = machine.get("nom", "Inconnu")
    ip = machine.get("ipAddress") or machine.get("numeroSerie")
    equipment_id = machine.get("_id") or machine.get("id")

    if not equipment_id:
        logger.error(f"❌ Impossible de créer incident pour {name}: ID équipement manquant")
        return

    key = f"{ip}_{res}"
    if key in sent_incidents and time.time() - sent_incidents[key] < COOLDOWN_SECONDS:
        return

    priority = "Critique" if val > th + 15 else "Élevée" if val > th + 10 else "Moyenne"
    data = {
        "title": f"⚠️ {res.upper()} élevé - {name}",
        "description": f"{res.upper()}={val:.1f}% (Seuil {th}%) sur {name} ({ip})",
        "priority": priority,
        "status": "Nouveau",
        "equipment": str(equipment_id),
    }

    try:
        r = requests.post(
            f"{BACKEND_URL}{INCIDENT_ENDPOINT}",
            json=data,
            headers=get_headers(),
            timeout=5
        )
        if r.status_code in (200, 201):
            sent_incidents[key] = time.time()
            logger.warning(f"🚨 INCIDENT CRÉÉ: {name} - {res.upper()}={val:.1f}% ({priority})")
        else:
            logger.error(f"❌ Erreur création incident: {r.status_code} - {r.text}")
    except Exception as e:
        logger.error(f"❌ Envoi incident échoué: {e}")

# ==============================
# GET EQUIPEMENTS
# ==============================
def get_equipements():
    try:
        r = requests.get(f"{BACKEND_URL}/api/equipements", headers=get_headers(), timeout=5)

        if r.status_code == 404:
            r = requests.get(f"{BACKEND_URL}/api/equipment", headers=get_headers(), timeout=5)

        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list):
                return data
            return data.get("data", data.get("equipements", []))
        else:
            logger.error(f"❌ Erreur récupération équipements: {r.status_code} - {r.text}")
            return []
    except Exception as e:
        logger.error(f"❌ Erreur récupération équipements: {e}")
        return []

# ==============================
# INFLUX HELPERS
# ==============================
def init_influx():
    global influx_client, write_api
    if not INFLUX_AVAILABLE:
        logger.warning("⚠️ influxdb_client non disponible — les métriques ne seront pas envoyées à InfluxDB")
        return False
    try:
        influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
        write_api = influx_client.write_api(write_options=SYNCHRONOUS)
        logger.info("✅ Client InfluxDB initialisé")
        return True
    except Exception as e:
        logger.error(f"❌ Erreur initialisation InfluxDB: {e}")
        return False

def write_metrics_to_influx(eq, cpu, ram, disk):
    if not INFLUX_AVAILABLE or write_api is None:
        return
    try:
        # Mesure principale : machine_metrics
        p = Point("machine_metrics") \
            .tag("machine", eq.get("nom", "inconnu")) \
            .tag("ip", str(eq.get("ipAddress") or eq.get("numeroSerie") or "inconnu")) \
            .field("cpu", float(cpu) if cpu is not None else 0.0) \
            .field("ram", float(ram) if ram is not None else 0.0) \
            .field("disk", float(disk) if disk is not None else 0.0) \
            .time(datetime.utcnow(), WritePrecision.NS)
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=p)

        # ✅ Mesure secondaire : machine_status
        # (1 = en ligne, 0 = hors ligne)
        status = 1 if (cpu is not None or ram is not None or disk is not None) else 0
        status_point = Point("machine_status") \
            .tag("machine", eq.get("nom", "inconnu")) \
            .tag("ip", str(eq.get("ipAddress") or eq.get("numeroSerie") or "inconnu")) \
            .field("status", status) \
            .time(datetime.utcnow(), WritePrecision.NS)
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=status_point)

    except Exception as e:
        logger.debug(f"Erreur écriture Influx pour {eq.get('nom')}: {e}")


# ==============================
# MAIN LOOP
# ==============================
def main():
    logger.info("=" * 80)
    logger.info("🚀 AGENT HYBRIDE - SNMP (Linux) + WMI (Windows) + InfluxDB")
    logger.info("=" * 80)
    logger.info(f"📦 Modules: SNMP={'✅' if SNMP_AVAILABLE else '❌'} | WMI={'✅' if WMI_AVAILABLE else '❌'} | Influx={'✅' if INFLUX_AVAILABLE else '❌'}")
    logger.info(f"💻 Système local: {platform.system()}")
    logger.info("=" * 80)

    if not authenticate():
        logger.error("❌ Authentification échouée, arrêt de l'agent")
        return

    # Init Influx (optionnel)
    if INFLUX_AVAILABLE:
        init_influx()

    equipements = get_equipements()
    logger.info(f"📡 Nombre total d'équipements: {len(equipements)}")

    monitored = []
    for eq in equipements:
        ip = eq.get("ipAddress") or eq.get("numeroSerie")
        if is_valid_ip(ip) or is_localhost(ip):
            monitored.append(eq)
            eq_id = eq.get("_id") or eq.get("id")
            logger.info(f"   ✅ {eq.get('nom','inconnu')} ({ip}) - ID: {eq_id}")

    if not monitored:
        logger.error("❌ Aucune machine valide trouvée !")
        return

    logger.info(f"\n✅ {len(monitored)} machine(s) seront surveillées")
    logger.info(f"⏱️  Intervalle: {CHECK_INTERVAL}s | Seuils: CPU={THRESHOLD_CPU}% RAM={THRESHOLD_RAM}% DISK={THRESHOLD_DISK}%")
    logger.info("=" * 80 + "\n")

    try:
        while True:
            for eq in monitored:
                ip = eq.get("ipAddress") or eq.get("numeroSerie")
                metrics = get_metrics(ip)

                if metrics is None:
                    logger.warning(f"⚠️ {eq.get('nom','inconnu'):20s} | Non accessible")
                    continue

                cpu = metrics.get("cpu")
                ram = metrics.get("ram")
                disk = metrics.get("disk")

                cpu_str = f"{cpu:.1f}%" if cpu is not None else "N/A"
                ram_str = f"{ram:.1f}%" if ram is not None else "N/A"
                disk_str = f"{disk:.1f}%" if disk is not None else "N/A"

                logger.info(f"✅ {eq.get('nom','inconnu'):20s} | CPU: {cpu_str:7s} | RAM: {ram_str:7s} | DISK: {disk_str:7s}")

                # write to influx (if disponible)
                write_metrics_to_influx(eq, cpu, ram, disk)

                if cpu is not None and cpu > THRESHOLD_CPU:
                    send_incident(eq, "CPU", cpu, THRESHOLD_CPU)

                if ram is not None and ram > THRESHOLD_RAM:
                    send_incident(eq, "RAM", ram, THRESHOLD_RAM)

                if disk is not None and disk > THRESHOLD_DISK:
                    send_incident(eq, "DISK", disk, THRESHOLD_DISK)

            time.sleep(CHECK_INTERVAL)
    except KeyboardInterrupt:
        logger.info("Arrêt manuel demandé, sortie...")
    except Exception as e:
        logger.error(f"Erreur dans la boucle principale: {e}")
    finally:
        try:
            if influx_client:
                influx_client.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()
