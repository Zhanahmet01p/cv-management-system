const fs = require('fs');

const replaceInFile = (file, replacers) => {
  let content = fs.readFileSync(file, 'utf8');
  for (const { from, to } of replacers) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content);
};

// NavBar.jsx
replaceInFile('src/components/NavBar.jsx', [
  { from: "import React, {", to: "import {" },
  { from: "import React from 'react';", to: "" }
]);

// AuthContext.jsx
let auth = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');
const fetchUserMatch = auth.match(/const fetchUser = async \(\) => \{[\s\S]*?^\s*\};\n/m);
if (fetchUserMatch) {
  auth = auth.replace(fetchUserMatch[0], '');
  auth = auth.replace('useEffect(() => {', fetchUserMatch[0] + '\n  useEffect(() => {');
  // remove unused disable
  auth = auth.replace('      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setLoading(false);', '      setLoading(false);');
  fs.writeFileSync('src/context/AuthContext.jsx', auth);
}

// AdminDashboard.jsx
replaceInFile('src/pages/AdminDashboard.jsx', [
  { from: /const \[selected, setSelected\] = useState\(new Set\(\)\);\n/, to: '' }
]);

// CVView.jsx
let cvview = fs.readFileSync('src/pages/CVView.jsx', 'utf8');
cvview = cvview.replace("import { useEffect, useState, useCallback, useRef } from 'react';", "import { useEffect, useState, useRef } from 'react';");

const loadFunc = `
  const load = async () => {
    try {
      const res = await fetchCV(id);
      setData(res.data);
      setLikeCount(res.data.cv?.likes?.length ?? 0);
      const myLike = res.data.cv?.likes?.some(l => l.userId === user?.id);
      setLiked(!!myLike);
    } catch (e) {
      setError(e.response?.data?.error || 'Could not load CV');
    } finally {
      setLoading(false);
    }
  };
`;
cvview = cvview.replace('  useEffect(() => {', loadFunc + '\n  useEffect(() => {');
fs.writeFileSync('src/pages/CVView.jsx', cvview);

// Positions.jsx
replaceInFile('src/pages/Positions.jsx', [
  { from: '} catch (_) {', to: '} catch {' },
  { from: '} catch (_) {', to: '} catch {' }
]);

console.log('Fixes applied');
