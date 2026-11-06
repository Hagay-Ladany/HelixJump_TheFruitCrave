// Shared 3D artwork. The game controller owns the collision objects and rules.
const ArcadeArt = {
    themes: {
        1: { name: 'orchard', sky: 0x5e83a6, light: 0xffeac7, hub: 0x6a4591, tiles: [0x27cfb8, 0x7fb5fa, 0xb692ed, 0xf5c962] },
        2: { name: 'night', sky: 0x38395f, light: 0xd5d6ff, hub: 0x444471, tiles: [0x608df4, 0xa578e0, 0x4fcbb6] },
        3: { name: 'jungle', sky: 0x467975, light: 0xf1ffb8, hub: 0x316c69, tiles: [0x91d960, 0x49ce9c, 0xedd264] },
        4: { name: 'lava', sky: 0x542b49, light: 0xffc3a3, hub: 0x503055, tiles: [0xc580da, 0xf1a560, 0xe9cd77] },
        5: { name: 'cosmic', sky: 0x493475, light: 0xe5b9ff, hub: 0x5e3c8e, tiles: [0x9b75e8, 0xe07fce, 0x6caaf6] }
    },

    playerColor: 0xff9966,
    hazardColor: 0xe63954,
    pickupColors: { apple: 0xf44d62, banana: 0xffd843, chocolate: 0xe9a16e, diamond: 0x66e9ff },

    enamel(color, shininess = 38) {
        return new THREE.MeshPhongMaterial({ color, specular: 0x666174, shininess });
    },

    platformMaterials(color) {
        const side = new THREE.Color(color).multiplyScalar(0.52);
        return [this.enamel(color), this.enamel(side, 20)];
    },

    platformGeometry() {
        const shape = new THREE.Shape();
        const angle = Math.PI / 6;
        shape.absarc(0, 0, 1.6, 0, angle, false);
        shape.absarc(0, 0, 2.5, angle, 0, true);
        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.28, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3
        }).rotateX(-Math.PI / 2);
    },

    hazardMark() {
        const stripes = [1.81, 2.10].map(radius => {
            const shape = new THREE.Shape();
            shape.moveTo(radius, 0.35);
            shape.lineTo(radius + 0.14, 0.49);
            shape.lineTo(radius, 0.69);
            shape.lineTo(radius + 0.10, 0.69);
            shape.lineTo(radius + 0.25, 0.49);
            shape.lineTo(radius + 0.10, 0.35);
            shape.closePath();
            return shape;
        });
        const geometry = new THREE.ShapeGeometry(stripes).rotateX(-Math.PI / 2);
        return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffe7ac }));
    },

    pickupModels() {
        const sphere = new THREE.SphereGeometry(1, 16, 12);
        const leafMaterial = this.enamel(0x6fd04e);
        const stemMaterial = this.enamel(0x6f3932, 12);

        const apple = new THREE.Group();
        const skin = this.enamel(this.pickupColors.apple, 68);
        for (const x of [-0.085, 0.085]) {
            const lobe = new THREE.Mesh(sphere, skin);
            lobe.position.x = x;
            lobe.scale.set(0.245, 0.267, 0.245);
            apple.add(lobe);
        }
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.033, 0.15, 8), stemMaterial);
        stem.position.y = 0.28;
        stem.rotation.z = -0.22;
        const leaf = new THREE.Mesh(sphere, leafMaterial);
        leaf.position.set(0.12, 0.30, 0);
        leaf.rotation.z = 0.45;
        leaf.scale.set(0.125, 0.045, 0.052);
        apple.add(stem, leaf);

        const banana = new THREE.Group();
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.29, 0.20, 0),
            new THREE.Vector3(-0.23, -0.04, 0),
            new THREE.Vector3(0, -0.16, 0),
            new THREE.Vector3(0.22, -0.10, 0),
            new THREE.Vector3(0.32, 0.08, 0)
        ]);
        const peel = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.096, 8, false), this.enamel(this.pickupColors.banana));
        banana.add(peel);
        for (const endpoint of [0, 1]) {
            const tip = new THREE.Mesh(sphere, stemMaterial);
            tip.position.copy(curve.getPoint(endpoint));
            tip.scale.set(0.076, 0.055, 0.078);
            banana.add(tip);
        }

        const chocolate = new THREE.Group();
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.14), this.enamel(0x763628));
        chocolate.add(bar);
        const square = new THREE.BoxGeometry(0.194, 0.162, 0.085);
        const cocoa = this.enamel(0xb56946, 22);
        for (const x of [-0.11, 0.11]) {
            for (const y of [-0.19, 0, 0.19]) {
                const piece = new THREE.Mesh(square, cocoa);
                piece.position.set(x, y, 0.078);
                chocolate.add(piece);
            }
        }
        chocolate.rotation.z = -0.2;

        const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.37), new THREE.MeshPhongMaterial({
            color: this.pickupColors.diamond, emissive: 0x16718d, emissiveIntensity: 0.45, specular: 0xe6fbff,
            shininess: 95, flatShading: true
        }));
        diamond.scale.y = 1.16;
        return { apple, banana, chocolate, diamond };
    }
};
