import requests

# Free tier of ip-api.com: 45 requests/minute per IP, HTTP only (no HTTPS on free
# plan), no API key required. Good enough for a low-traffic portfolio site.
IP_API_URL = "http://ip-api.com/json/{ip}"
IP_API_FIELDS = "status,message,country,regionName,lat,lon"
LOCAL_IPS = {"127.0.0.1", "::1", "localhost", "testclient"}


def get_client_ip(request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


def lookup_ip(ip: str) -> dict | None:
    """Look up approximate location for an IP. Returns only country, region
    (state/province) and rounded lat/lng — never the IP itself is persisted
    by callers of this function."""
    if not ip or ip in LOCAL_IPS or ip.startswith("192.168.") or ip.startswith("10."):
        return None

    try:
        resp = requests.get(
            IP_API_URL.format(ip=ip),
            params={"fields": IP_API_FIELDS},
            timeout=3,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException:
        return None

    if data.get("status") != "success":
        return None

    return {
        "country": data.get("country"),
        "region_name": data.get("regionName"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
    }
