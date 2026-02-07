import time
import json
import os
import requests


BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


def post_json(path: str, payload: dict):
    url = f"{BASE_URL}{path}"
    t0 = time.perf_counter()
    resp = requests.post(url, json=payload, timeout=60)
    dt = (time.perf_counter() - t0) * 1000.0
    return resp, dt


def main():
    print(f"Benchmarking against {BASE_URL}")

    # 1) Interpret
    interpret_payload = {"description": "5-day Tokyo trip focused on culture and food, moderate budget"}
    resp, dt = post_json("/api/v1/trip/interpret", interpret_payload)
    print(f"/interpret: {dt:.1f} ms, status={resp.status_code}")
    params = resp.json()

    # 2) Generate (first run)
    resp, dt1 = post_json("/api/v1/trip/generate", params)
    print(f"/generate (cold): {dt1:.1f} ms, status={resp.status_code}")
    plan = resp.json()

    # 3) Generate (second run - should benefit from search caching)
    resp, dt2 = post_json("/api/v1/trip/generate", params)
    print(f"/generate (warm): {dt2:.1f} ms, status={resp.status_code}")

    # 4) Export PDF
    resp, dt3 = post_json("/api/v1/trip/export/pdf", plan)
    size = len(resp.content) if resp.ok else 0
    print(f"/export/pdf: {dt3:.1f} ms, status={resp.status_code}, bytes={size}")

    summary = {
        "interpret_ms": dt,
        "generate_cold_ms": dt1,
        "generate_warm_ms": dt2,
        "export_pdf_ms": dt3,
        "pdf_bytes": size,
    }
    print("Summary:")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()