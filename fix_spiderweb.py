import re

file_path = '/home/lonk/GitHub/taller_frontend/src/features/floor/Floor.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the spiderweb logic with hub and spoke
old_logic = """    if (doorCenters.length > 1) {
        for (let i = 0; i < doorCenters.length; i++) {
            for (let j = i + 1; j < doorCenters.length; j++) {
                drawLane(doorCenters[i].x, doorCenters[i].y, doorCenters[j].x, doorCenters[j].y);
            }
        }
    } else if (doorCenters.length === 1) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        drawLane(doorCenters[0].x, doorCenters[0].y, centerX, centerY);
    }"""

new_logic = """    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    for (const door of doorCenters) {
        drawLane(door.x, door.y, centerX, centerY);
    }"""

content = content.replace(old_logic, new_logic)

with open(file_path, 'w') as f:
    f.write(content)
print("Updated traffic lane logic.")
