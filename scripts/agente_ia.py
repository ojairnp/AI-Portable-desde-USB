import json
import os
import random
import sys
import requests

PROMPT = (
    "Eres un consultor de negocio experto en licitaciones publicas, moda "
    "y finanzas personales. Genera UN solo insight corto (maximo 45 palabras), "
    "practico y accionable, para un emprendedor mexicano que gestiona licitaciones, "
    "tres marcas de ropa/accesorios, e inversiones en cripto e interes compuesto. "
    "Responde SOLO el insight, sin introducciones ni comillas."
)

def llamar_groq():
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        return None
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": "Bearer " + key},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": PROMPT}],
            "temperature": 0.8
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()

def llamar_gemini():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.0-flash:generateContent?key=" + key
    )
    r = requests.post(
        url,
        json={"contents": [{"parts": [{"text": PROMPT}]}]},
        timeout=30
    )
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

def llamar_deepseek():
    key = os.environ.get("DEEPSEEK_API_KEY")
    if not key:
        return None
    r = requests.post(
        "https://api.deepseek.com/chat/completions",
        headers={"Authorization": "Bearer " + key},
        json={
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": PROMPT}]
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()

def llamar_openrouter():
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        return None
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": "Bearer " + key},
        json={
            "model": "meta-llama/llama-3.3-70b-instruct:free",
            "messages": [{"role": "user", "content": PROMPT}]
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()

def llamar_nvidia():
    key = os.environ.get("NVIDIA_API_KEY")
    if not key:
        return None
    r = requests.post(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        headers={"Authorization": "Bearer " + key},
        json={
            "model": "meta/llama-3.3-70b-instruct",
            "messages": [{"role": "user", "content": PROMPT}]
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()

def llamar_zai():
    key = os.environ.get("ZAI_API_KEY")
    if not key:
        return None
    r = requests.post(
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        headers={"Authorization": "Bearer " + key},
        json={
            "model": "glm-4-flash",
            "messages": [{"role": "user", "content": PROMPT}]
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()

def generar_insight():
    proveedores = [
        ("Groq", llamar_groq),
        ("Gemini", llamar_gemini),
        ("DeepSeek", llamar_deepseek),
        ("OpenRouter", llamar_openrouter),
        ("NVIDIA", llamar_nvidia),
        ("Z.ai", llamar_zai),
    ]
    random.shuffle(proveedores)
    for nombre, funcion in proveedores:
        try:
            resultado = funcion()
            if resultado:
                return nombre, resultado
        except Exception as e:
            print("Fallo " + nombre + ": " + str(e), file=sys.stderr)
            continue
    return None, None

if __name__ == "__main__":
    proveedor, texto = generar_insight()
    if not texto:
        print("ERROR: ningun proveedor de IA respondio.", file=sys.stderr)
        sys.exit(1)

    salida = {
        "proveedor": proveedor,
        "insight": texto
    }

    with open("data/insight_ia.json", "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)

    print("Insight generado con " + proveedor + ": " + texto)
