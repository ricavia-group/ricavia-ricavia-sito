"""Chat dell'Osservatorio: il riconoscimento delle domande (assets/js/14-chat.js + assets/data/chat-qa.json) si prova in Node."""
import os
import shutil
import subprocess
import unittest

QUI = os.path.dirname(os.path.abspath(__file__))


class TestChat(unittest.TestCase):
    def test_riconoscimento(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node non installato')
        r = subprocess.run([node, os.path.join(QUI, 'chat_qa.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == '__main__':
    unittest.main()
