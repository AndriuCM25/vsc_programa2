import pandas as pd
import random
import numpy as np

# 🎯 Nombres peruanos comunes (sin tildes)
nombres_peru = [
    "Juan", "Pedro", "Luis", "Carlos", "Jorge", "Jose", "Miguel", "Victor", "Alfredo", "Martin",
    "Ricardo", "Hugo", "Raul", "Diego", "Cesar", "Manuel", "Arturo", "Daniel", "Fernando", "Andres",
    "Julio", "Renato", "Sergio", "Cristian", "Wilson", "Marco", "Angel", "Gustavo", "Hernan", "Omar",
    "Maria", "Carmen", "Rosa", "Lucia", "Ana", "Patricia", "Veronica", "Sandra", "Carolina", "Gabriela",
    "Elizabeth", "Katherine", "Daniela", "Fiorella", "Claudia", "Milagros", "Natalia", "Andrea", "Melissa",
    "Diana", "Paola", "Yolanda", "Beatriz", "Ruth", "Margarita", "Cecilia", "Elena", "Susana", "Silvia"
]

# 🎯 Apellidos peruanos comunes (sin tildes)
apellidos_peru = [
    "Quispe", "Huaman", "Perez", "Garcia", "Rojas", "Torres", "Ramirez", "Sanchez", "Flores",
    "Castillo", "Chavez", "Martinez", "Vasquez", "Gomez", "Diaz", "Mendoza", "Cardenas", "Aguilar",
    "Salazar", "Cruz", "Morales", "Gutierrez", "Reyes", "Lopez", "Ortega", "Fernandez", "Montoya",
    "Valverde", "Campos", "Paredes", "Mejia", "Bravo", "Calderon", "Romero", "Becerra", "Soto",
    "Villanueva", "Aliaga", "Espinoza", "Velasquez", "Palacios", "Arce", "Guerrero", "Ibanez",
    "Valdez", "Leon", "Navarro", "Acosta", "Mamani", "Condori", "Ccopa", "Laura", "Apaza", "Cutipa",
    "Ticona", "Choque", "Calla", "Ccahuana", "Poma", "Huarcaya", "Chambi", "Yupanqui", "Zevallos"
]

# 🎯 Distritos de Lima (sin tildes)
distritos_lima = [
    "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina", "San Borja", "San Miguel", 
    "Jesus Maria", "Pueblo Libre", "Callao", "Chorrillos", "Comas", "Villa El Salvador", 
    "Independencia", "Los Olivos", "Brena", "Lince", "Magdalena", "Surquillo", "Ate", 
    "Rimac", "Villa Maria del Triunfo", "El Agustino", "Carabayllo", "Santa Anita", "San Juan de Lurigancho", 
    "San Juan de Miraflores", "San Martin de Porres", "Puente Piedra", "Cercado de Lima"
]

# 🎯 Tipos de cuenta (sin tildes) con pesos diferentes
tipos_cuenta = [
    ("Cuenta de ahorro", 0.45),         # 45% de probabilidad
    ("Cuenta corriente", 0.30),         # 30% de probabilidad
    ("Cuenta para trabajadores o nomina", 0.20),  # 20% de probabilidad
    ("Cuenta a plazo fijo", 0.05)       # 5% de probabilidad
]

# 🎯 Distritos con pesos diferentes (distritos populares tienen más peso)
distritos_pesos = {
    "San Juan de Lurigancho": 0.12,
    "San Martin de Porres": 0.10,
    "Comas": 0.09,
    "Ate": 0.08,
    "Villa El Salvador": 0.07,
    "Puente Piedra": 0.07,
    "Los Olivos": 0.07,
    "Callao": 0.06,
    "San Juan de Miraflores": 0.06,
    "Independencia": 0.05,
    "Cercado de Lima": 0.04,
    "Surco": 0.03,
    "La Molina": 0.03,
    "San Borja": 0.02,
    "Jesus Maria": 0.02,
    "Lince": 0.02,
    "Miraflores": 0.01,
    "San Isidro": 0.01,
    "Barranco": 0.01,
    "Magdalena": 0.01,
    "Pueblo Libre": 0.01,
    "San Miguel": 0.01,
    "Chorrillos": 0.01,
    "Rimac": 0.01,
    "Villa Maria del Triunfo": 0.01,
    "El Agustino": 0.01,
    "Carabayllo": 0.01,
    "Santa Anita": 0.01,
    "Surquillo": 0.01,
    "Brena": 0.01
}

data = []

# Preparar listas para selección ponderada
tipos_cuenta_list = [tipo for tipo, peso in tipos_cuenta]
tipos_cuenta_pesos = [peso for tipo, peso in tipos_cuenta]

distritos_list = list(distritos_pesos.keys())
distritos_pesos_list = list(distritos_pesos.values())

for i in range(1, 50001):  # 50,000 registros
    # Nombre completo: nombre + 2 apellidos
    nombre = f"{random.choice(nombres_peru)} {random.choice(apellidos_peru)} {random.choice(apellidos_peru)}"

    # DNI (8 digitos)
    dni = str(random.randint(10000000, 99999999))

    # Correo (sin caracteres especiales)
    correo = f"{nombre.replace(' ', '.').lower()}@bcp.com.pe"

    # Telefono peruano (+51 9XXXXXXX)
    telefono = f"+51 9{random.randint(10000000, 99999999)}"

    # Tipo de cuenta - distribución no uniforme
    cuenta = random.choices(tipos_cuenta_list, weights=tipos_cuenta_pesos, k=1)[0]

    # Distrito - distribución no uniforme
    distrito = random.choices(distritos_list, weights=distritos_pesos_list, k=1)[0]

    # Deuda - distribución no uniforme (70% NO, 30% SI)
    deuda = random.choices(["NO", "SI"], weights=[0.7, 0.3], k=1)[0]

    # 🎯 Monto actual con distribucion realista (valores enteros)
    prob = random.random()
    if prob < 0.5:   # 50% clientes con menos de 1,000 soles
        monto_actual_num = random.randint(50, 999)
    elif prob < 0.85:  # 35% clientes entre 1,000 y 10,000
        monto_actual_num = random.randint(1000, 9999)
    else:   # 15% clientes con mas de 10,000 (hasta 100,000)
        monto_actual_num = random.randint(10000, 100000)

    # 🎯 Cuanto debe (si aplica) - valores enteros
    if deuda == "SI":
        # Los que deben suelen deber entre 20% y 80% de su monto actual
        cuanto_debe_num = int(monto_actual_num * random.uniform(0.2, 0.8))
    else:
        cuanto_debe_num = 0

    # Formato simple sin decimales ni separadores
    monto_actual = f"S/ {monto_actual_num}"
    cuanto_debe = f"S/ {cuanto_debe_num}"

    data.append([i, dni, nombre, correo, telefono, cuenta, distrito, deuda, monto_actual, cuanto_debe])

# Crear DataFrame
df = pd.DataFrame(data, columns=[
    "ID",
    "DNI",
    "NOMBRE Y APELLIDOS",
    "CORREO",
    "TELEFONO",
    "TIPO DE CUENTA",
    "DISTRITO",
    "DEUDA",
    "MONTO ACTUAL S",
    "CUANTO DEBE S"
])

# Guardar en Excel y CSV
df.to_excel("BANCO_BCP_LIMA.xlsx", index=False)
df.to_csv("BANCO_BCP_LIMA.csv", index=False, encoding="utf-8")

print("✅ Archivos BANCO_BCP_LIMA.xlsx y BANCO_BCP_LIMA.csv generados con 50,000 registros realistas.")
print("\nDistribución esperada:")
print("- Tipos de cuenta: 45% Ahorro, 30% Corriente, 20% Nómina, 5% Plazo fijo")
print("- Deuda: 70% NO, 30% SI")
print("- Distritos: Distribución no uniforme con mayor peso en distritos populares")