import json
import os
import re
import subprocess
import sys
import shutil
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "Bookie_Dookie", "Bookie_Dookie_Dj")
FRONTEND_DIR = os.path.join(ROOT_DIR, "Bookie-Dookie")
BACKEND_VENV_PY = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
PORTABLE_NPM = os.path.join(
    ROOT_DIR, ".tools", "node", "node-v24.15.0-win-x64", "npm.cmd"
)
LOG_PATH = os.path.join(ROOT_DIR, "test_run.log")
JEST_JSON_PATH = os.path.join(ROOT_DIR, "jest-results.json")


def _select_backend_python():
    return BACKEND_VENV_PY if os.path.exists(BACKEND_VENV_PY) else sys.executable


def _log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def _run_command(cmd, cwd):
    _log(f"COMMAND: {' '.join(cmd)}")
    _log(f"CWD: {cwd}")
    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    output = (result.stdout or "") + (result.stderr or "")
    _log(f"EXIT CODE: {result.returncode}")
    return result.returncode, output


def _parse_pytest_summary(output):
    match = re.search(r"(\d+) passed(, (\d+) failed)?", output)
    if not match:
        return None
    passed = int(match.group(1))
    failed = int(match.group(3) or 0)
    return {"passed": passed, "failed": failed, "total": passed + failed}


def _parse_coverage_total(output):
    match = re.search(r"TOTAL\s+\d+\s+\d+\s+(\d+)%", output)
    if not match:
        return None
    return int(match.group(1))


def _parse_jest_summary(output):
    match = re.search(r"Tests:\s+(\d+) passed,\s+(\d+) total", output)
    if not match:
        return None
    passed = int(match.group(1))
    total = int(match.group(2))
    failed = total - passed
    return {"passed": passed, "failed": failed, "total": total}


def _parse_pytest_cases(output):
    cases = []
    for line in output.splitlines():
        match = re.search(r"(tests\\[^\s]+::[^\s]+)\s+(PASSED|FAILED|SKIPPED|XFAIL|XPASS)", line)
        if match:
            cases.append({"name": match.group(1), "status": match.group(2)})
    return cases


def _parse_jest_cases():
    if not os.path.exists(JEST_JSON_PATH):
        return []
    with open(JEST_JSON_PATH, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    cases = []
    for test_file in data.get("testResults", []):
        for assertion in test_file.get("assertionResults", []):
            full_name = "::".join([
                os.path.basename(test_file.get("name", "")),
                assertion.get("fullName", ""),
            ])
            cases.append({"name": full_name, "status": assertion.get("status", "")})
    return cases


def run_backend_tests(with_coverage=False, detailed=True):
    python_exe = _select_backend_python()
    cmd = [python_exe, "-m", "pytest"]
    if detailed:
        cmd.append("-vv")
    if with_coverage:
        cmd += [
            "--cov=Books",
            "--cov=Users",
            "--cov=Dashboard",
            "--cov-report=term-missing",
        ]
    code, output = _run_command(cmd, BACKEND_DIR)
    print(output)
    return code, output


def run_backend_known_issues():
    python_exe = _select_backend_python()
    cmd = [python_exe, "-m", "pytest", "-vv", "-m", "known_issue"]
    code, output = _run_command(cmd, BACKEND_DIR)
    print(output)
    return code, output


def run_frontend_tests():
    npm_cmd = shutil.which("npm") or PORTABLE_NPM
    cmd = [
        npm_cmd,
        "test",
        "--",
        "--runInBand",
        "--json",
        f"--outputFile={JEST_JSON_PATH}",
    ]
    code, output = _run_command(cmd, FRONTEND_DIR)
    print(output)
    return code, output


def run_frontend_known_issues():
    npm_cmd = shutil.which("npm") or PORTABLE_NPM
    cmd = [
        npm_cmd,
        "test",
        "--",
        "--runInBand",
        "--testPathPattern=known_issues.test.js",
        "--testPathIgnorePatterns=",
    ]
    code, output = _run_command(cmd, FRONTEND_DIR)
    print(output)
    return code, output


def print_summary(backend_output=None, frontend_output=None, coverage_output=None):
    print("\n========================")
    print("TEST SUMMARY REPORT")
    print("========================")
    if backend_output:
        summary = _parse_pytest_summary(backend_output)
        if summary:
            print("Backend:")
            print(f"- Passed: {summary['passed']}")
            print(f"- Failed: {summary['failed']}")
        else:
            print("Backend: summary not found")
    if frontend_output:
        summary = _parse_jest_summary(frontend_output)
        if summary:
            print("Frontend:")
            print(f"- Passed: {summary['passed']}")
            print(f"- Failed: {summary['failed']}")
        else:
            print("Frontend: summary not found")
    if coverage_output:
        coverage = _parse_coverage_total(coverage_output)
        if coverage is not None:
            print(f"Coverage: {coverage}%")
        else:
            print("Coverage: not found")

    if backend_output:
        cases = _parse_pytest_cases(backend_output)
        if cases:
            print("\nBackend Test Cases:")
            for case in cases:
                print(f"- {case['name']} [{case['status']}]")
    if frontend_output:
        cases = _parse_jest_cases()
        if cases:
            print("\nFrontend Test Cases:")
            for case in cases:
                print(f"- {case['name']} [{case['status']}]")


def main():
    _log("Starting test runner")
    while True:
        print("\nTest Runner Menu")
        print("1. Run backend tests")
        print("2. Run frontend tests")
        print("3. Run all tests")
        print("4. Show coverage (backend)")
        print("5. Run known-issue tests")
        print("6. Exit")

        choice = input("Select an option: ").strip()

        if choice == "1":
            _log("STEP: Run backend tests")
            code, output = run_backend_tests()
            print_summary(backend_output=output)
        elif choice == "2":
            _log("STEP: Run frontend tests")
            code, output = run_frontend_tests()
            print_summary(frontend_output=output)
        elif choice == "3":
            _log("STEP: Run all tests")
            backend_code, backend_output = run_backend_tests()
            frontend_code, frontend_output = run_frontend_tests()
            print_summary(backend_output=backend_output, frontend_output=frontend_output)
            if backend_code or frontend_code:
                sys.exit(1)
        elif choice == "4":
            _log("STEP: Run backend tests with coverage")
            code, output = run_backend_tests(with_coverage=True)
            print_summary(backend_output=output, coverage_output=output)
        elif choice == "5":
            _log("STEP: Run known-issue tests")
            backend_code, backend_output = run_backend_known_issues()
            frontend_code, frontend_output = run_frontend_known_issues()
            print_summary(backend_output=backend_output, frontend_output=frontend_output)
            if backend_code == 0 and frontend_code == 0:
                print("Known-issue tests unexpectedly passed.")
        elif choice == "6":
            _log("Exiting test runner")
            return
        else:
            print("Invalid choice. Please enter 1-5.")


if __name__ == "__main__":
    main()
