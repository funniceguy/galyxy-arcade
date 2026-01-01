import { WALL_THICKNESS } from './Constants.js';

export class PhysicsWorld {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.runner = Matter.Runner.create();
        this.render = null;
        this.walls = [];
        this.ground = null;

        this.init();
    }

    init() {
        // Create Renderer
        this.render = Matter.Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false, // Set false to see sprites/colors
                background: 'transparent'
            }
        });

        // Add Boundaries
        this.createBoundaries();

        // Listen to resize
        window.addEventListener('resize', () => this.handleResize());

        // Start Runner
        Matter.Render.run(this.render);
        Matter.Runner.run(this.runner, this.engine);
    }

    createBoundaries() {
        // Remove existing if any
        if (this.ground) Matter.World.remove(this.world, this.ground);
        if (this.walls.length > 0) Matter.World.remove(this.world, this.walls);

        const width = this.canvas.width;
        const height = this.canvas.height;
        const thickness = WALL_THICKNESS;

        // Ground
        this.ground = Matter.Bodies.rectangle(width / 2, height + thickness / 2 - 10, width, thickness, {
            isStatic: true,
            label: 'ground',
            render: { fillStyle: '#2d3436' }
        });

        // Left Wall
        const leftWall = Matter.Bodies.rectangle(0 - thickness / 2, height / 2, thickness, height * 2, {
            isStatic: true,
            label: 'wall_left',
            render: { fillStyle: '#2d3436' }
        });

        // Right Wall
        const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
            isStatic: true,
            label: 'wall_right',
            render: { fillStyle: '#2d3436' }
        });

        this.walls = [leftWall, rightWall];

        Matter.World.add(this.world, [this.ground, leftWall, rightWall]);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // this.render.options.width = this.canvas.width; // Matter Render automatically handles resizing if we update canvas? No, usually need to tell render
        this.render.bounds.max.x = this.canvas.width;
        this.render.bounds.max.y = this.canvas.height;
        this.render.options.width = this.canvas.width;
        this.render.options.height = this.canvas.height;

        this.createBoundaries();
    }

    addBody(body) {
        Matter.World.add(this.world, body);
    }

    removeBody(body) {
        Matter.World.remove(this.world, body);
    }
}
