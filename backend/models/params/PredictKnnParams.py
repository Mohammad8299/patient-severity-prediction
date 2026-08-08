from dataclasses import dataclass

@dataclass
class PredictKnnParams:
    age: int
    temperature: float
    blood_pressure: int
    heart_rate: float
    oxygen_level: float
    symptom_count: int
    days_with_symptom: int
    previous_diseases: int
    medication_count: int
    test_score: int

    def to_model_params(self):
        return ModelKnnParams(
            age=self.age,
            temperature=self.temperature,
            blood_pressure=self.blood_pressure,
            heart_rate=self.heart_rate,
            oxygen_level=self.oxygen_level,
            symptom_count=self.symptom_count,
            days_with_symptom=self.days_with_symptom,
            previous_diseases=self.previous_diseases,
            medication_count=self.medication_count,
            test_score=self.test_score,
        )


@dataclass
class ModelKnnParams:
    age: int
    temperature: float
    blood_pressure: int
    heart_rate: float
    oxygen_level: float
    symptom_count: int
    days_with_symptom: int
    previous_diseases: int
    medication_count: int
    test_score: int

    def to_array(self):
        return [
            self.age,
            self.temperature,
            self.blood_pressure,
            self.heart_rate,
            self.oxygen_level,
            self.symptom_count,
            self.days_with_symptom,
            self.previous_diseases,
            self.medication_count,
            self.test_score,
        ]
