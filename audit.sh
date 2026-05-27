#!/bin/bash
# Comprehensive UI Audit Script for PrimeContractorOS
cd /home/ubuntu/primecontractoros

echo "=== AUDIT: Empty onClick handlers ==="
grep -rn 'onClick={() => {}}' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/"

echo ""
echo "=== AUDIT: onClick with only console.log ==="
grep -rn -A2 'onClick=' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | grep "console.log"

echo ""
echo "=== AUDIT: Buttons without onClick (not in forms) ==="
grep -rn '<Button' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | grep -v "onClick" | grep -v "type=\"submit\"" | grep -v "asChild" | grep -v "variant=" | grep -v "disabled" | head -40

echo ""
echo "=== AUDIT: Links with href='#' ==="
grep -rn "href=[\"']#[\"']" client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/"

echo ""
echo "=== AUDIT: Links to potentially non-existent routes ==="
grep -rn 'href="\|to="' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | grep -v "http" | grep -v "mailto:" | grep -v "#" | grep -oP '(href|to)="[^"]*"' | sort -u

echo ""
echo "=== AUDIT: navigate() calls to check routes ==="
grep -rn 'navigate("' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | grep -oP 'navigate\("[^"]*"' | sort -u

echo ""
echo "=== AUDIT: Disabled buttons without messaging ==="
grep -rn 'disabled' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | grep "Button\|button" | head -20

echo ""
echo "=== AUDIT: window.open or window.location calls ==="
grep -rn 'window\.\(open\|location\)' client/src/pages/ client/src/components/ --include="*.tsx" | grep -v "node_modules" | grep -v "ui/" | head -20
