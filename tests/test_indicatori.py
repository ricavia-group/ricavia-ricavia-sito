"""Calcolatore della pagina Indicatori (assets/js/16-indicatori.js): i conti si provano in Node."""
import os
import shutil
import subprocess
import unittest

QUI = os.path.dirname(os.path.abspath(__file__))


class TestIndicatori(unittest.TestCase):
    def test_calcolatore(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node non installato')
        r = subprocess.run([node, os.path.join(QUI, 'indicatori.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == '__main__':
    unittest.main()
