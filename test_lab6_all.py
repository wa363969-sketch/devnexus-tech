import unittest
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import re

# ══════════════════════════════════════════════════════════════════════════════
#  FUNCTIONS UNDER TEST
# ══════════════════════════════════════════════════════════════════════════════

# Task 1 – already done (calculate_grade)

# ── Task 2: is_prime ──────────────────────────────────────────────────────────
def is_prime(n):
    if not isinstance(n, int) or isinstance(n, bool):
        raise TypeError("Input must be an integer")
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

# ── Task 3: validate_email ────────────────────────────────────────────────────
def validate_email(email):
    if not isinstance(email, str):
        raise TypeError("Email must be a string")
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return bool(re.match(pattern, email))

# ── Task 4: BankAccount ───────────────────────────────────────────────────────
class BankAccount:
    def __init__(self, balance=0):
        if balance < 0:
            raise ValueError("Initial balance cannot be negative")
        self.balance = balance

    def deposit(self, amount):
        if not isinstance(amount, (int, float)) or isinstance(amount, bool):
            raise TypeError("Amount must be numeric")
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if not isinstance(amount, (int, float)) or isinstance(amount, bool):
            raise TypeError("Amount must be numeric")
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return self.balance

# ── Task 5: StudentRegistration ───────────────────────────────────────────────
class StudentRegistration:
    def __init__(self):
        self.students = {}

    def register(self, student_id, name, age):
        if not isinstance(student_id, str) or not student_id.strip():
            raise ValueError("Student ID must be a non-empty string")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Name must be a non-empty string")
        if not isinstance(age, int) or isinstance(age, bool):
            raise TypeError("Age must be an integer")
        if age < 5 or age > 100:
            raise ValueError("Age must be between 5 and 100")
        if student_id in self.students:
            raise ValueError(f"Student ID '{student_id}' already exists")
        self.students[student_id] = {"name": name, "age": age}
        return True

    def get_student(self, student_id):
        if student_id not in self.students:
            raise KeyError(f"Student '{student_id}' not found")
        return self.students[student_id]

    def remove_student(self, student_id):
        if student_id not in self.students:
            raise KeyError(f"Student '{student_id}' not found")
        del self.students[student_id]
        return True

# ══════════════════════════════════════════════════════════════════════════════
#  TEST CLASSES
# ══════════════════════════════════════════════════════════════════════════════

class TestIsPrime(unittest.TestCase):
    def test_prime_2(self):           self.assertTrue(is_prime(2))
    def test_prime_3(self):           self.assertTrue(is_prime(3))
    def test_prime_7(self):           self.assertTrue(is_prime(7))
    def test_prime_13(self):          self.assertTrue(is_prime(13))
    def test_prime_97(self):          self.assertTrue(is_prime(97))
    def test_not_prime_1(self):       self.assertFalse(is_prime(1))
    def test_not_prime_0(self):       self.assertFalse(is_prime(0))
    def test_not_prime_negative(self):self.assertFalse(is_prime(-5))
    def test_not_prime_4(self):       self.assertFalse(is_prime(4))
    def test_not_prime_composite(self):self.assertFalse(is_prime(100))
    def test_type_error_float(self):
        with self.assertRaises(TypeError): is_prime(3.0)
    def test_type_error_string(self):
        with self.assertRaises(TypeError): is_prime("7")
    def test_type_error_bool(self):
        with self.assertRaises(TypeError): is_prime(True)
    def test_type_error_none(self):
        with self.assertRaises(TypeError): is_prime(None)
    def test_large_prime(self):       self.assertTrue(is_prime(7919))

class TestValidateEmail(unittest.TestCase):
    def test_valid_simple(self):      self.assertTrue(validate_email("user@example.com"))
    def test_valid_subdomain(self):   self.assertTrue(validate_email("user@mail.example.com"))
    def test_valid_dots_in_name(self):self.assertTrue(validate_email("first.last@example.com"))
    def test_valid_plus_sign(self):   self.assertTrue(validate_email("user.name@domain.org"))
    def test_valid_long_tld(self):    self.assertTrue(validate_email("user@example.info"))
    def test_invalid_no_at(self):     self.assertFalse(validate_email("userexample.com"))
    def test_invalid_no_domain(self): self.assertFalse(validate_email("user@"))
    def test_invalid_no_tld(self):    self.assertFalse(validate_email("user@example"))
    def test_invalid_double_at(self): self.assertFalse(validate_email("user@@example.com"))
    def test_invalid_empty(self):     self.assertFalse(validate_email(""))
    def test_invalid_spaces(self):    self.assertFalse(validate_email("user @example.com"))
    def test_type_error_int(self):
        with self.assertRaises(TypeError): validate_email(123)
    def test_type_error_none(self):
        with self.assertRaises(TypeError): validate_email(None)
    def test_type_error_list(self):
        with self.assertRaises(TypeError): validate_email(["user@x.com"])

class TestBankAccount(unittest.TestCase):
    def setUp(self): self.acc = BankAccount(1000)

    def test_initial_balance(self):       self.assertEqual(self.acc.balance, 1000)
    def test_deposit_positive(self):      self.assertEqual(self.acc.deposit(500), 1500)
    def test_deposit_float(self):         self.assertAlmostEqual(self.acc.deposit(100.50), 1100.50)
    def test_deposit_updates_balance(self):
        self.acc.deposit(200); self.assertEqual(self.acc.balance, 1200)
    def test_deposit_zero_raises(self):
        with self.assertRaises(ValueError): self.acc.deposit(0)
    def test_deposit_negative_raises(self):
        with self.assertRaises(ValueError): self.acc.deposit(-100)
    def test_deposit_string_raises(self):
        with self.assertRaises(TypeError): self.acc.deposit("500")
    def test_deposit_bool_raises(self):
        with self.assertRaises(TypeError): self.acc.deposit(True)
    def test_withdraw_valid(self):        self.assertEqual(self.acc.withdraw(400), 600)
    def test_withdraw_exact_balance(self):self.assertEqual(self.acc.withdraw(1000), 0)
    def test_withdraw_float(self):        self.assertAlmostEqual(self.acc.withdraw(99.99), 900.01)
    def test_withdraw_insufficient(self):
        with self.assertRaises(ValueError): self.acc.withdraw(2000)
    def test_withdraw_zero_raises(self):
        with self.assertRaises(ValueError): self.acc.withdraw(0)
    def test_withdraw_negative_raises(self):
        with self.assertRaises(ValueError): self.acc.withdraw(-50)
    def test_withdraw_string_raises(self):
        with self.assertRaises(TypeError): self.acc.withdraw("200")
    def test_negative_initial_balance_raises(self):
        with self.assertRaises(ValueError): BankAccount(-100)

class TestStudentRegistration(unittest.TestCase):
    def setUp(self): self.sys = StudentRegistration()

    def test_register_valid(self):
        self.assertTrue(self.sys.register("S001","Alice",20))
    def test_register_stores_data(self):
        self.sys.register("S001","Alice",20)
        self.assertEqual(self.sys.get_student("S001"),{"name":"Alice","age":20})
    def test_register_multiple(self):
        self.sys.register("S001","Alice",20)
        self.sys.register("S002","Bob",22)
        self.assertEqual(len(self.sys.students), 2)
    def test_duplicate_id_raises(self):
        self.sys.register("S001","Alice",20)
        with self.assertRaises(ValueError): self.sys.register("S001","Bob",21)
    def test_empty_id_raises(self):
        with self.assertRaises(ValueError): self.sys.register("","Alice",20)
    def test_empty_name_raises(self):
        with self.assertRaises(ValueError): self.sys.register("S001","",20)
    def test_age_too_young_raises(self):
        with self.assertRaises(ValueError): self.sys.register("S001","Alice",4)
    def test_age_too_old_raises(self):
        with self.assertRaises(ValueError): self.sys.register("S001","Alice",101)
    def test_age_boundary_min(self):
        self.assertTrue(self.sys.register("S001","Alice",5))
    def test_age_boundary_max(self):
        self.assertTrue(self.sys.register("S001","Alice",100))
    def test_age_float_raises(self):
        with self.assertRaises(TypeError): self.sys.register("S001","Alice",20.5)
    def test_age_bool_raises(self):
        with self.assertRaises(TypeError): self.sys.register("S001","Alice",True)
    def test_get_nonexistent_raises(self):
        with self.assertRaises(KeyError): self.sys.get_student("S999")
    def test_remove_student(self):
        self.sys.register("S001","Alice",20)
        self.assertTrue(self.sys.remove_student("S001"))
        self.assertEqual(len(self.sys.students), 0)
    def test_remove_nonexistent_raises(self):
        with self.assertRaises(KeyError): self.sys.remove_student("S999")

if __name__ == "__main__":
    unittest.main(verbosity=2)
