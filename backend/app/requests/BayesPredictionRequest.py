from pydantic import BaseModel, Field


class BayesPredictionRequest(BaseModel):
    age: int = Field(ge=0)
    temperature: float = Field(ge=0)
    blood_pressure: int = Field(ge=0)
    heart_rate: float = Field(ge=0)
    oxygen_level: float = Field(ge=0)
    symptom_count: int = Field(ge=0)
    days_with_symptom: int = Field(ge=0)
    previous_diseases: int = Field(ge=0)
    medication_count: int = Field(ge=0)
    test_score: int = Field(ge=0)
