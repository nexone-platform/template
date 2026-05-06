// Mock MenuTree based on the user's screenshot
const mockMenuTree = [
  { menuId: '1', title: 'Main', menuType: 'heading', isActive: false },
  { 
    menuId: '2', title: 'Overview', menuType: 'submenu', isActive: false,
    children: [
      { menuId: '2-1', title: 'System Overview', menuType: 'menu', isActive: false }
    ]
  },
  { 
    menuId: '3', title: 'Organization', menuType: 'submenu', isActive: false,
    children: [
      { menuId: '3-1', title: 'Company', menuType: 'menu', isActive: false }
    ]
  },
  { menuId: '4', title: 'Administration', menuType: 'heading', isActive: false },
  { 
    menuId: '5', title: 'User Management', menuType: 'submenu', isActive: false,
    children: [
      { menuId: '5-1', title: 'Users', menuType: 'menu', isActive: false }
    ]
  }
];

// The logic I implemented
const handleToggleUse = (menuId, currentTree) => {
  const idsToToggle = new Set();
  let newActiveState = false;

  const findTarget = (nodes) => {
    for (const n of nodes) {
      if (String(n.menuId) === String(menuId)) return n;
      if (n.children) {
        const found = findTarget(n.children);
        if (found) return found;
      }
    }
    return null;
  };

  const target = findTarget(currentTree);
  if (!target) return currentTree;

  newActiveState = !target.isActive;
  idsToToggle.add(String(target.menuId));

  const collectDescendants = (nodes) => {
    nodes.forEach(n => {
      idsToToggle.add(String(n.menuId));
      if (n.children) collectDescendants(n.children);
    });
  };

  const mType = target.menuType || target.menu_type;
  if (String(mType).toLowerCase() === 'heading') {
    const findAndAddSiblings = (nodes) => {
      const idx = nodes.findIndex(n => String(n.menuId) === String(menuId));
      if (idx !== -1) {
        for (let i = idx + 1; i < nodes.length; i++) {
          const sibType = nodes[i].menuType || nodes[i].menu_type;
          if (String(sibType).toLowerCase() === 'heading') break;
          idsToToggle.add(String(nodes[i].menuId));
          if (nodes[i].children) collectDescendants(nodes[i].children);
        }
      } else {
        for (const n of nodes) {
          if (n.children) findAndAddSiblings(n.children);
        }
      }
    };
    findAndAddSiblings(currentTree);
  }

  if (target.children) collectDescendants(target.children);

  const apply = (nodes) => {
    return nodes.map(n => {
      const children = n.children ? apply(n.children) : n.children;
      if (idsToToggle.has(String(n.menuId))) {
        return {
          ...n,
          isActive: newActiveState,
          children
        };
      }
      return { ...n, children };
    });
  };

  return apply(currentTree);
};

// TEST CASE: Toggle 'Main' (ID: 1)
console.log('--- Toggle Main (ID: 1) ---');
const result = handleToggleUse('1', mockMenuTree);
result.forEach(n => {
  console.log(`${n.title}: ${n.isActive}`);
  if (n.children) n.children.forEach(c => console.log(`  ${c.title}: ${c.isActive}`));
});

// TEST CASE: Toggle 'Administration' (ID: 4)
console.log('\n--- Toggle Administration (ID: 4) ---');
const result2 = handleToggleUse('4', result);
result2.forEach(n => {
  console.log(`${n.title}: ${n.isActive}`);
  if (n.children) n.children.forEach(c => console.log(`  ${c.title}: ${c.isActive}`));
});
