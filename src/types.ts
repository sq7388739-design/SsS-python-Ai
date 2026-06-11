export interface PythonTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  code: string;
}

export interface TestCase {
  inputExpr: string;   // Python expression to evaluate or test, e.g. "fizz_buzz(3)"
  expectedValue: any;  // Expected outcome to show
  testCode: string;    // Executable snippet to verify results
}

export interface Challenge {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  difficultyEn: "Easy" | "Medium" | "Hard";
  difficultyAr: "سهل" | "متوسط" | "صعب";
  categoryEn: "Algorithms" | "Data Structures" | "Logic" | "Math";
  categoryAr: "خوارزميات" | "هياكل بيانات" | "منطق" | "رياضيات";
  initialCode: string;
  testCases: TestCase[];
  testRunnerPython: string; // The test script runner that prints JSON results
}

export interface TestResult {
  testExpr: string;
  expected: any;
  actual: any;
  passed: boolean;
  error?: string;
}

export const BuiltInTemplates: PythonTemplate[] = [
  {
    id: "welcome",
    titleEn: "Hello, Python!",
    titleAr: "مرحباً بايثون!",
    descriptionEn: "A classic warm greeting and introduction to standard library structures.",
    descriptionAr: "ترحيب كلاسيكي بسيط مع استعراض تراكيب البيانات الأساسية والمكتبات القياسية.",
    code: `# مرحباً بك في أقوى منصة تفاعلية لتعلم بايثون!
# Welcome to the Ultimate Python Interactive Playground!

import math
import random
import datetime

# 1. طباعة نصوص وقيم أساسية
name = "المبرمج الذكي"
print(f"أهلاً بك يا {name}!")
print("Let's explore python built-in tools...")

# 2. استخدام مكتبة الرياضيات (math)
radius = 5
area = math.pi * (radius ** 2)
print(f"مساحة الدائرة بنصف قطر {radius} هي: {area:.2f}")

# 3. استخدام العشوائية والتكرار (random & loops)
random_numbers = [random.randint(1, 100) for _ in range(5)]
print(f"قائمة أرقام عشوائية: {random_numbers}")

# 4. تصفية الأرقام الزوجية بأسلوب بايثون الأنيق (List Comprehension)
even_numbers = [num for num in random_numbers if num % 2 == 0]
print(f"الأرقام الزوجية فقط: {even_numbers}")

# 5. الوقت والتاريخ الحالي
today = datetime.datetime.now()
print(f"التاريخ والوقت الحالي: {today.strftime('%Y-%m-%d %H:%M:%S')}")
`
  },
  {
    id: "bubble_sort",
    titleEn: "Bubble Sort Visualizer",
    titleAr: "خوارزمية فرز الفقاعات",
    descriptionEn: "Classic visual sorting algorithm with step-by-step console print logging.",
    descriptionAr: "ترتيب وتنظيم مصفوفة عشوائية بأسلوب خوارزمية الفرز الفقاعي الكلاسيكية مع تتبع للمراحل.",
    code: `def bubble_sort(arr):
    n = len(arr)
    print(f"المصفوفة الأصلية المراد ترتيبها: {arr}")
    print("-" * 40)
    
    for i in range(n):
        swapped = False
        print(f"\\nالجولة رقم {i + 1}:")
        
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # تبديل العناصر
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                print(f"  تم تبديل {arr[j+1]} مع {arr[j]} -> المصفوفة الآن: {arr}")
                
        if not swapped:
            print("  المصفوفة مرتبة تماماً الآن! إنهاء مبكر للخوارزمية.")
            break
            
    return arr

# اختبار الخوارزمية
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print("-" * 40)
print(f"النتيجة النهائية المرتبة: {sorted_numbers}")
`
  },
  {
    id: "data_structure",
    titleEn: "Stack & Queue Data Structures",
    titleAr: "مكدس وطابور (Stack & Queue)",
    descriptionEn: "Implements classic Stack (LIFO) and Queue (FIFO) operations using standard lists and collections.",
    descriptionAr: "تطبيق عملي لمفاهيم مكدس (LIFO) وطابور (FIFO) باستخدام القوائم والمكتبات القياسية بنجاح.",
    code: `from collections import deque

# --- 1. المكدس (Stack) بأسلوب LIFO (Last In, First Out) ---
print("=== 1. مكدس البيانات (Stack) ===")
stack = []

# إضافة عناصر للمكدس (Push)
stack.append("صحة برمجية")
stack.append("خوارزميات")
stack.append("بايثون")
print(f"المكدس بعد إضافة العناصر: {stack}")

# سحب عنصر (Pop)
top_item = stack.pop()
print(f"تم سحب العنصر من الأعلى: '{top_item}'")
print(f"المكتبة المتبقية في المكدس: {stack}")
print()

# --- 2. الطابور (Queue) بأسلوب FIFO (First In, First Out) ---
print("=== 2. طابور البيانات (Queue) ===")
queue = deque()

# إضافة عناصر للطابور (Enqueue)
queue.append("طلب رقم 1 - تذكرة")
queue.append("طلب رقم 2 - دفع")
queue.append("طلب رقم 3 - شحن")
print(f"طابور الطلبات الحالي: {list(queue)}")

# معالجة أول عنصر (Dequeue)
served = queue.popleft()
print(f"تمت تلبية ومعالجة: '{served}'")
print(f"الطلبات المتبقية في الانتظار: {list(queue)}")
`
  },
  {
    id: "oop",
    titleEn: "Object-Oriented Programming (OOP)",
    titleAr: "البرمجة كائنية التوجه (OOP)",
    descriptionEn: "Demos classes, initializers, inheritance, and method overriding in Python.",
    descriptionAr: "تجربة نموذجية للفئات (Classes)، التوريث، وتخطي الدوال الأساسية بكفاءة عالية.",
    code: `class Vehicle:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
        self.speed = 0

    def accelerate(self, increment):
        self.speed += increment
        return f"تتسارع المركبة بمقدار {increment}! السرعة الحالية: {self.speed} كم/س"

    def get_info(self):
        return f"{self.year} {self.make} {self.model}"


# فئة فرعية ترث من الفئة الأساسية (Inheritance)
class ElectricCar(Vehicle):
    def __init__(self, make, model, year, battery_capacity):
        # استدعاء مشيد الفئة الأبوية
        super().__init__(make, model, year)
        self.battery_capacity = battery_capacity # بالكيلوواط

    # تخطي دالة الأب (Method Overriding)
    def get_info(self):
        parent_info = super().get_info()
        return f"{parent_info} (سيارة كهربائية 🔋 ببطارية {self.battery_capacity} kWh)"


# إنشاء كائنات واختبارها
car1 = Vehicle("Toyota", "Camry", 2024)
print(car1.get_info())
print(car1.accelerate(60))
print()

tesla = ElectricCar("Tesla", "Model S", 2025, 100)
print(tesla.get_info())
print(tesla.accelerate(120))
`
  }
];

export const BuiltInChallenges: Challenge[] = [
  {
    id: "fizzbuzz",
    titleEn: "The FizzBuzz Standard",
    titleAr: "تحدي الفيز بز (FizzBuzz)",
    descriptionEn: "Write a function 'fizz_buzz(n)' that returns 'Fizz' if n is divisible by 3, 'Buzz' if divisible by 5, 'FizzBuzz' if divisible by both, or the number as a string otherwise.",
    descriptionAr: "اكتب دالة باسم 'fizz_buzz(n)' ترجع النص 'Fizz' إذا كان الرقم يقبل القسمة على 3، والنص 'Buzz' إذا كان يقبل القسمة على 5، والنص 'FizzBuzz' إذا كان يقبل عليهما معاً، أو تعيد الرقم نفسه كـ نص في الحالات الأخرى.",
    difficultyEn: "Easy",
    difficultyAr: "سهل",
    categoryEn: "Logic",
    categoryAr: "منطق",
    initialCode: `def fizz_buzz(n):
    # اكتب الكود الخاص بك هنا
    pass
`,
    testCases: [
      { inputExpr: "fizz_buzz(3)", expectedValue: "Fizz", testCode: "" },
      { inputExpr: "fizz_buzz(5)", expectedValue: "Buzz", testCode: "" },
      { inputExpr: "fizz_buzz(15)", expectedValue: "FizzBuzz", testCode: "" },
      { inputExpr: "fizz_buzz(7)", expectedValue: "7", testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": str(actual),
        "passed": str(actual) == str(expected)
    })

try:
    run_test("fizz_buzz(3)", "Fizz", fizz_buzz(3))
    run_test("fizz_buzz(5)", "Buzz", fizz_buzz(5))
    run_test("fizz_buzz(15)", "FizzBuzz", fizz_buzz(15))
    run_test("fizz_buzz(7)", "7", fizz_buzz(7))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  },
  {
    id: "palindrome",
    titleEn: "Palindrome String Checker",
    titleAr: "التحقق من الكلمة المتناظرة",
    descriptionEn: "Write a function 'is_palindrome(s)' that returns True if the string is identical forwards and backwards (case-insensitive, ignoring punctuation/spaces), else False.",
    descriptionAr: "اكتب دالة باسم 'is_palindrome(s)' ترجع ثنائياً (True/False) للتحقق مما إذا كانت الكلمة أو العبارة المعطاة تقرأ بالطريقة نفسها في الاتجاهين (بصرف النظر عن الحروف الكبيرة أو الفراغات).",
    difficultyEn: "Easy",
    difficultyAr: "سهل",
    categoryEn: "Algorithms",
    categoryAr: "خوارزميات",
    initialCode: `def is_palindrome(s):
    # اكتب الكود هنا لفلترة الفراغات والتحقق من التناظر
    pass
`,
    testCases: [
      { inputExpr: "is_palindrome('radar')", expectedValue: true, testCode: "" },
      { inputExpr: "is_palindrome('Python')", expectedValue: false, testCode: "" },
      { inputExpr: "is_palindrome('A man a plan a canal Panama')", expectedValue: true, testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": actual,
        "passed": bool(actual) == bool(expected)
    })

try:
    # clean inputs are vital
    run_test("is_palindrome('radar')", True, is_palindrome("radar"))
    run_test("is_palindrome('Python')", False, is_palindrome("Python"))
    run_test("is_palindrome('A man a plan a canal Panama')", True, is_palindrome("A man a plan a canal Panama"))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  },
  {
    id: "fibonacci",
    titleEn: "Nth Fibonacci Number",
    titleAr: "حساب حد متتالية فيبوناتشي",
    descriptionEn: "Write a function 'fib(n)' that accepts an integer n and returns the N-th Fibonacci number. The sequence is: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ... etc.",
    descriptionAr: "اكتب دالة باسم 'fib(n)' تستقبل عدداً صحيحاً وترجع الحد النوني لسلسلة فيبوناتشي الشهيرة (حيث الحد 0 قيمته 0، الحد 1 قيمته 1، والحدود التالية هي مجموع سابقاتها).",
    difficultyEn: "Medium",
    difficultyAr: "متوسط",
    categoryEn: "Math",
    categoryAr: "رياضيات",
    initialCode: `def fib(n):
    # اكتب الكود الخاص بك هنا (تذكر الحالات الصفرية وفعالية الكود)
    pass
`,
    testCases: [
      { inputExpr: "fib(0)", expectedValue: 0, testCode: "" },
      { inputExpr: "fib(1)", expectedValue: 1, testCode: "" },
      { inputExpr: "fib(6)", expectedValue: 8, testCode: "" },
      { inputExpr: "fib(12)", expectedValue: 144, testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": int(actual) if isinstance(actual, (int, float)) else str(actual),
        "passed": int(actual) == expected if isinstance(actual, (int, float)) else False
    })

try:
    run_test("fib(0)", 0, fib(0))
    run_test("fib(1)", 1, fib(1))
    run_test("fib(6)", 8, fib(6))
    run_test("fib(12)", 144, fib(12))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  },
  {
    id: "anagram",
    titleEn: "Anagram String Checker",
    titleAr: "التحقق من جناس الأناجرام",
    descriptionEn: "Write a function 'are_anagrams(str1, str2)' that returns True if the two given strings contain exactly the same letters in different order, case-insensitive, else False.",
    descriptionAr: "اكتب دالة باسم 'are_anagrams(str1, str2)' للتحقق من إذا كانت الكلمتان تتكونان من نفس الحروف والرموز بالضبط بترتيب مختلف تلقائياً (مثل listen و silent).",
    difficultyEn: "Easy",
    difficultyAr: "سهل",
    categoryEn: "Algorithms",
    categoryAr: "خوارزميات",
    initialCode: `def are_anagrams(str1, str2):
    # رتب أحرف الكلمتين وقارنهما في الكود
    pass
`,
    testCases: [
      { inputExpr: "are_anagrams('silent', 'listen')", expectedValue: true, testCode: "" },
      { inputExpr: "are_anagrams('triangle', 'integral')", expectedValue: true, testCode: "" },
      { inputExpr: "are_anagrams('apple', 'aple')", expectedValue: false, testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": actual,
        "passed": bool(actual) == bool(expected)
    })

try:
    run_test("are_anagrams('silent', 'listen')", True, are_anagrams("silent", "listen"))
    run_test("are_anagrams('triangle', 'integral')", True, are_anagrams("triangle", "integral"))
    run_test("are_anagrams('apple', 'aple')", False, are_anagrams("apple", "aple"))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  },
  {
    id: "balanced_brackets",
    titleEn: "Balanced Parentheses Checker",
    titleAr: "تحدي الأقواس المتوازنة",
    descriptionEn: "Write a function 'is_balanced(expr)' that checks if round (), square [], and curly {} brackets in a string are correctly closed and matched.",
    descriptionAr: "اكتب دالة 'is_balanced(expr)' للتحقق من أن الأقواس المتنوعة (المربعة والمستديرة والمفتوحة) في النص مغلقة بشكل متطابق ومنسق ترتيبياً.",
    difficultyEn: "Hard",
    difficultyAr: "صعب",
    categoryEn: "Data Structures",
    categoryAr: "هياكل بيانات",
    initialCode: `def is_balanced(expr):
    # استخدم مفهوم المكدس (Stack) المساعد للتحقق
    pass
`,
    testCases: [
      { inputExpr: "is_balanced('{[()]}')", expectedValue: true, testCode: "" },
      { inputExpr: "is_balanced('{[(])}')", expectedValue: false, testCode: "" },
      { inputExpr: "is_balanced('(()')", expectedValue: false, testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": actual,
        "passed": bool(actual) == bool(expected)
    })

try:
    run_test("is_balanced('{[()]}')", True, is_balanced("{[()]}"))
    run_test("is_balanced('{[(])}')", False, is_balanced("{[(])}"))
    run_test("is_balanced('(()')", False, is_balanced("(()"))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  },
  {
    id: "prime_sum",
    titleEn: "Sum of Primes Up to N",
    titleAr: "مجموع الأعداد الأولية إلى حد معين",
    descriptionEn: "Write a function 'sum_primes(limit)' that returns the sum of all prime numbers less than or equal to a given limit (limit >= 2).",
    descriptionAr: "اكتب دالة 'sum_primes(limit)' لحساب مجموع كافة الأعداد الأولية الأصغر من أو تساوي المدخل المعطى.",
    difficultyEn: "Medium",
    difficultyAr: "متوسط",
    categoryEn: "Math",
    categoryAr: "رياضيات",
    initialCode: `def sum_primes(limit):
    # أوجد الأعداد الأولية ثم اجمعها بنجاح
    pass
`,
    testCases: [
      { inputExpr: "sum_primes(10)", expectedValue: 17, testCode: "" },  // 2 + 3 + 5 + 7 = 17
      { inputExpr: "sum_primes(20)", expectedValue: 77, testCode: "" },  // 17 + 11 + 13 + 17 + 19 = 77
      { inputExpr: "sum_primes(2)", expectedValue: 2, testCode: "" }
    ],
    testRunnerPython: `
import json
results = []
def run_test(expr, expected, actual):
    results.append({
        "testExpr": expr,
        "expected": expected,
        "actual": int(actual) if isinstance(actual, (int, float)) else str(actual),
        "passed": int(actual) == expected if isinstance(actual, (int, float)) else False
    })

try:
    run_test("sum_primes(10)", 17, sum_primes(10))
    run_test("sum_primes(20)", 77, sum_primes(20))
    run_test("sum_primes(2)", 2, sum_primes(2))
except Exception as e:
    results.append({
        "testExpr": "Execution Check",
        "expected": "No crash",
        "actual": str(e),
        "passed": False
    })

print("---TEST_RESULTS_START---")
print(json.dumps(results))
print("---TEST_RESULTS_END---")
`
  }
];
