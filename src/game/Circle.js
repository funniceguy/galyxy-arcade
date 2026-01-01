import { FRUITS, PHYSICS } from './Constants.js';

export class Circle {
    static create(x, y, level) {
        const fruitData = FRUITS[level];
        if (!fruitData) return null;

        const radius = fruitData.radius;
        // Use sprite if available, else color
        // For now, assuming direct color rendering or sprite texture loading
        const spritePath = `assets/images/${fruitData.label}.svg`;

        const body = Matter.Bodies.circle(x, y, radius, {
            label: `fruit_${level}`, // Format: fruit_0, fruit_1...
            restitution: PHYSICS.RESTITUTION,
            friction: PHYSICS.FRICTION,
            density: PHYSICS.DENSITY,
            render: {
                fillStyle: fruitData.color,
                sprite: {
                    texture: spritePath,
                    xScale: (radius * 2) / 100, // Assuming 100x100 SVG
                    yScale: (radius * 2) / 100
                }
            }
        });

        // Store level data in the body for easy access during collision
        body.fruitLevel = level;
        body.ismerged = false; // Flag to prevent double merging

        return body;
    }
}
