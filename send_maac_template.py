"""
MAAC Open API - Send template message to jin hsueh
Usage: python send_maac_template.py
"""

import json
import urllib.request
import urllib.error

TOKEN = "0ngn1gDCsPRp3YBRIE/jcw1c4pHgtQm4ITw4StCBCtk="
BASE_URL = "https://api.cresclab.com"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}


def api_get(path):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        headers=HEADERS,
        method="GET",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def api_post(path, body):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(body).encode(),
        headers=HEADERS,
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def find_jin_hsueh():
    print("=== 查詢聯絡人 jin hsueh ===")
    try:
        members = api_get("/openapi/v1/member/")
        print(f"取得 {len(members)} 筆聯絡人")
        for m in members:
            name = m.get("name", "") or ""
            if "jin" in name.lower() or "hsueh" in name.lower():
                print(f"找到: {m}")
                return m
        # fallback: print all and let user pick
        print("未找到 jin hsueh，列出所有聯絡人：")
        for m in members:
            print(f"  id={m.get('id')} line_uid={m.get('line_uid')} name={m.get('name')}")
        return None
    except urllib.error.HTTPError as e:
        print(f"查詢聯絡人失敗: {e.code} {e.read().decode()}")
        return None


def get_templates():
    print("\n=== 查詢可用模板 ===")
    try:
        templates = api_get("/openapi/v1/template/")
        for t in templates:
            print(f"  id={t.get('id')} name={t.get('name')}")
        return templates
    except urllib.error.HTTPError as e:
        print(f"查詢模板失敗: {e.code} {e.read().decode()}")
        return []


def send_template(template_id, line_uid):
    print(f"\n=== 發送模板 {template_id} 給 {line_uid} ===")
    body = {
        "template_id": template_id,
        "data": {
            "line_uid": line_uid,
        },
    }
    try:
        result = api_post("/openapi/v1/message/push/", body)
        print(f"發送結果: {result}")
        return result
    except urllib.error.HTTPError as e:
        print(f"發送失敗: {e.code} {e.read().decode()}")
        return None


def main():
    member = find_jin_hsueh()
    templates = get_templates()

    if not templates:
        print("沒有可用模板，結束。")
        return

    if not member:
        print("\n請手動輸入 line_uid：")
        line_uid = input("line_uid: ").strip()
    else:
        line_uid = member.get("line_uid")

    # 使用第一個模板
    template = templates[0]
    template_id = template.get("id")
    print(f"\n使用模板: id={template_id} name={template.get('name')}")

    send_template(template_id, line_uid)


if __name__ == "__main__":
    main()
