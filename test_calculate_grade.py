import unittest
from unittest.mock import patch
import io

# ── paste the function under test here ────────────────────────────────────────
def calculate_grade(marks):
    if not isinstance(marks, (int, float)) or isinstance(marks, bool):
        raise TypeError("Marks must be numeric")
    if marks < 0 or marks > 100:
        raise ValueError("Marks must be between 0 and 100")
    if marks >= 90:
        return "A"
    elif marks >= 80:
        return "B"
    elif marks >= 70:
        return "C"
    elif marks >= 60:
        return "D"
    else:
        return "F"
# ──────────────────────────────────────────────────────────────────────────────


class TestCalculateGrade(unittest.TestCase):

    # ── Grade boundary tests ───────────────────────────────────────────────────

    def test_grade_A_exact_90(self):
        """Marks = 90 → 'A' (lower boundary of A)"""
        self.assertEqual(calculate_grade(90), "A")

    def test_grade_A_above_90(self):
        """Marks = 95 → 'A'"""
        self.assertEqual(calculate_grade(95), "A")

    def test_grade_A_perfect_100(self):
        """Marks = 100 → 'A' (upper limit)"""
        self.assertEqual(calculate_grade(100), "A")

    def test_grade_B_exact_80(self):
        """Marks = 80 → 'B' (lower boundary of B)"""
        self.assertEqual(calculate_grade(80), "B")

    def test_grade_B_just_below_90(self):
        """Marks = 89.9 → 'B' (just below A boundary)"""
        self.assertEqual(calculate_grade(89.9), "B")

    def test_grade_B_mid(self):
        """Marks = 85 → 'B'"""
        self.assertEqual(calculate_grade(85), "B")

    def test_grade_C_exact_70(self):
        """Marks = 70 → 'C' (lower boundary of C)"""
        self.assertEqual(calculate_grade(70), "C")

    def test_grade_C_just_below_80(self):
        """Marks = 79.9 → 'C' (just below B boundary)"""
        self.assertEqual(calculate_grade(79.9), "C")

    def test_grade_C_mid(self):
        """Marks = 75 → 'C'"""
        self.assertEqual(calculate_grade(75), "C")

    def test_grade_D_exact_60(self):
        """Marks = 60 → 'D' (lower boundary of D)"""
        self.assertEqual(calculate_grade(60), "D")

    def test_grade_D_just_below_70(self):
        """Marks = 69.9 → 'D' (just below C boundary)"""
        self.assertEqual(calculate_grade(69.9), "D")

    def test_grade_D_mid(self):
        """Marks = 65 → 'D'"""
        self.assertEqual(calculate_grade(65), "D")

    def test_grade_F_just_below_60(self):
        """Marks = 59.9 → 'F' (just below D boundary)"""
        self.assertEqual(calculate_grade(59.9), "F")

    def test_grade_F_zero(self):
        """Marks = 0 → 'F' (minimum valid marks)"""
        self.assertEqual(calculate_grade(0), "F")

    def test_grade_F_mid(self):
        """Marks = 30 → 'F'"""
        self.assertEqual(calculate_grade(30), "F")

    # ── Float marks tests ──────────────────────────────────────────────────────

    def test_float_marks_in_A_range(self):
        """Float marks 92.5 → 'A'"""
        self.assertEqual(calculate_grade(92.5), "A")

    def test_float_marks_in_B_range(self):
        """Float marks 83.7 → 'B'"""
        self.assertEqual(calculate_grade(83.7), "B")

    def test_float_marks_in_C_range(self):
        """Float marks 72.1 → 'C'"""
        self.assertEqual(calculate_grade(72.1), "C")

    def test_float_marks_in_D_range(self):
        """Float marks 61.5 → 'D'"""
        self.assertEqual(calculate_grade(61.5), "D")

    def test_float_marks_in_F_range(self):
        """Float marks 45.3 → 'F'"""
        self.assertEqual(calculate_grade(45.3), "F")

    # ── ValueError tests ───────────────────────────────────────────────────────

    def test_marks_above_100_raises_value_error(self):
        """Marks > 100 must raise ValueError"""
        with self.assertRaises(ValueError) as ctx:
            calculate_grade(101)
        self.assertIn("between 0 and 100", str(ctx.exception))

    def test_marks_below_0_raises_value_error(self):
        """Marks < 0 must raise ValueError"""
        with self.assertRaises(ValueError) as ctx:
            calculate_grade(-1)
        self.assertIn("between 0 and 100", str(ctx.exception))

    def test_marks_negative_float_raises_value_error(self):
        """Marks = -0.1 must raise ValueError"""
        with self.assertRaises(ValueError):
            calculate_grade(-0.1)

    def test_marks_100_1_raises_value_error(self):
        """Marks = 100.1 must raise ValueError"""
        with self.assertRaises(ValueError):
            calculate_grade(100.1)

    # ── TypeError tests ────────────────────────────────────────────────────────

    def test_string_marks_raises_type_error(self):
        """String input must raise TypeError"""
        with self.assertRaises(TypeError) as ctx:
            calculate_grade("85")
        self.assertIn("numeric", str(ctx.exception))

    def test_none_marks_raises_type_error(self):
        """None input must raise TypeError"""
        with self.assertRaises(TypeError):
            calculate_grade(None)

    def test_list_marks_raises_type_error(self):
        """List input must raise TypeError"""
        with self.assertRaises(TypeError):
            calculate_grade([85])

    def test_bool_true_raises_type_error(self):
        """True (bool) must raise TypeError — bool is subclass of int"""
        with self.assertRaises(TypeError):
            calculate_grade(True)

    def test_bool_false_raises_type_error(self):
        """False (bool) must raise TypeError"""
        with self.assertRaises(TypeError):
            calculate_grade(False)

    def test_dict_marks_raises_type_error(self):
        """Dict input must raise TypeError"""
        with self.assertRaises(TypeError):
            calculate_grade({"marks": 90})

    # ── Return type tests ──────────────────────────────────────────────────────

    def test_return_type_is_string(self):
        """Return value must always be a string"""
        for marks in [0, 60, 70, 80, 90, 100]:
            with self.subTest(marks=marks):
                self.assertIsInstance(calculate_grade(marks), str)

    def test_valid_grades_only(self):
        """Only 'A', 'B', 'C', 'D', 'F' are valid return values"""
        valid_grades = {"A", "B", "C", "D", "F"}
        for marks in [0, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]:
            with self.subTest(marks=marks):
                self.assertIn(calculate_grade(marks), valid_grades)

    # ── Edge cases ─────────────────────────────────────────────────────────────

    def test_exactly_zero(self):
        """0 is valid and returns 'F'"""
        self.assertEqual(calculate_grade(0), "F")

    def test_exactly_100(self):
        """100 is valid and returns 'A'"""
        self.assertEqual(calculate_grade(100), "A")

    def test_integer_marks_work(self):
        """Plain integers are accepted"""
        self.assertEqual(calculate_grade(int(75)), "C")

    def test_float_zero(self):
        """0.0 is valid and returns 'F'"""
        self.assertEqual(calculate_grade(0.0), "F")


if __name__ == "__main__":
    unittest.main(verbosity=2)
