
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(
    title="TerraForm AI",
    description="Climate-responsive shelter design prototype",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DesignRequest(BaseModel):
    area: float = Field(default=80, gt=0)
    occupants: int = Field(default=4, ge=1, le=30)
    temperature: float = 30
    humidity: float = Field(default=60, ge=0, le=100)
    rainfall: float = Field(default=100, ge=0)
    solar: float = Field(default=6, ge=0)
    wind: float = Field(default=10, ge=0)
    budget: float = Field(default=1000000, gt=0)
    location: Optional[str] = "Custom location"
    priority: Optional[str] = "balanced"


@app.get("/")
def home():
    return {
        "message": "TerraForm AI backend is running",
        "mode": "prototype",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/design")
def generate_design(request: DesignRequest):
    area = request.area
    occupants = request.occupants
    temperature = request.temperature
    humidity = request.humidity
    rainfall = request.rainfall
    solar = request.solar
    wind = request.wind
    budget = request.budget
    priority = (request.priority or "balanced").lower()

    # Climate-responsive recommendations
    hot_climate = temperature >= 30
    cold_climate = temperature <= 15
    humid_climate = humidity >= 70
    rainy_climate = rainfall >= 150
    sunny_climate = solar >= 5
    windy_climate = wind >= 25

    bedrooms = max(1, min(occupants, round(occupants / 2)))
    bathrooms = max(1, (occupants + 3) // 4)
    floors = 2 if area >= 140 and occupants >= 5 else 1

    # Approximate building dimensions
    footprint = area / floors
    width = max(5.0, round(footprint ** 0.5, 1))
    length = round(footprint / width, 1)
    wall_height = 3.2 if hot_climate else 2.9

    roof_pitch = 35 if rainy_climate else 25
    roof_overhang = 1.2 if hot_climate or rainy_climate else 0.6
    ventilation_openings = 6 if hot_climate or humid_climate else 3
    solar_panels = max(0, min(16, round(area / 12))) if sunny_climate else 0
    rainwater_tank_liters = (
        min(10000, max(500, round(rainfall * occupants * 2)))
        if rainy_climate else 500
    )

    if priority in ("cost", "budget"):
        finish_level = "economical"
        material_strategy = "Locally available materials and a compact layout"
    elif priority in ("sustainability", "carbon"):
        finish_level = "low-impact"
        material_strategy = "Lower-impact materials, solar energy, and rainwater collection"
    elif priority == "comfort":
        finish_level = "comfort-focused"
        material_strategy = "Shading, natural ventilation, and improved indoor comfort"
    else:
        finish_level = "balanced"
        material_strategy = "Balance construction cost, comfort, and environmental performance"

    recommendations = []

    if hot_climate:
        recommendations.append(
            "Use external shading, a reflective roof, and cross-ventilation."
        )
    if cold_climate:
        recommendations.append(
            "Prioritize insulation, airtight construction, and passive solar gain."
        )
    if humid_climate:
        recommendations.append(
            "Provide cross-ventilation and moisture-resistant finishes."
        )
    if rainy_climate:
        recommendations.append(
            "Use a steeper roof, rainwater collection, and well-drained foundations."
        )
    if sunny_climate:
        recommendations.append(
            "Consider rooftop solar panels and solar shading."
        )
    if windy_climate:
        recommendations.append(
            "Consider protected openings and a structurally engineered roof connection."
        )

    recommendations.append(
        f"Plan for approximately {bedrooms} bedroom(s) and {bathrooms} bathroom(s)."
    )
    recommendations.append(material_strategy)

    # Illustrative prototype scores, not certified engineering results.
    energy_score = min(
        98,
        max(20, round(55 + solar * 3 + (10 if hot_climate else 0))),
    )
    water_score = min(
        98,
        max(20, round(50 + rainfall / 10)),
    )
    comfort_score = min(
        98,
        max(20, round(75 - abs(temperature - 24) * 1.2
                      - max(0, humidity - 60) * 0.25)),
    )

    return {
        "message": "Climate-responsive concept generated successfully",
        "location": request.location,
        "priority": priority,
        "inputs": {
            "area": area,
            "occupants": occupants,
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": rainfall,
            "solar": solar,
            "wind": wind,
            "budget": budget,
        },
        "model_parameters": {
            "area": area,
            "occupants": occupants,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "floors": floors,
            "width": width,
            "length": length,
            "wall_height": wall_height,
            "roof_pitch": roof_pitch,
            "roof_overhang": roof_overhang,
            "ventilation_openings": ventilation_openings,
            "solar_panels": solar_panels,
            "rainwater_tank_liters": rainwater_tank_liters,
            "hot_climate": hot_climate,
            "cold_climate": cold_climate,
            "humid_climate": humid_climate,
            "rainy_climate": rainy_climate,
            "sunny_climate": sunny_climate,
            "windy_climate": windy_climate,
            "finish_level": finish_level,
        },
        "scores": {
            "energy": energy_score,
            "water": water_score,
            "comfort": comfort_score,
        },
        "recommendations": recommendations,
        "disclaimer": (
            "Conceptual prototype only. Scores and dimensions are estimates, "
            "not certified engineering, structural, or energy simulations."
        ),
    }

