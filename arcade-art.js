'use strict';

// 3. ARCADE ART 3D MODELS (Merged from PR #9 js/arcade-art.js + Upgrades)
    // =========================================================================
    const ArcadeArt = {
      enamel(color, emissive = 0x000000, emissiveIntensity = 0.15) {
        return new THREE.MeshStandardMaterial({
          color,
          roughness: 0.28,
          metalness: 0.12,
          emissive,
          emissiveIntensity
        });
      },

      createTileTexture(hexColor) {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        const col = new THREE.Color(hexColor);
        const base = '#' + col.getHexString();
        const light = '#' + col.clone().offsetHSL(0, 0.04, 0.14).getHexString();
        const dark = '#' + col.clone().offsetHSL(0, 0.02, -0.14).getHexString();
        const grad = ctx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, light);
        grad.addColorStop(0.55, base);
        grad.addColorStop(1, dark);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 120, 120);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, 0, 128, 18);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      },

      createPoleTexture() {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#e8dcc5';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#d4c3a3';
        for (let x = 0; x < 128; x += 16) ctx.fillRect(x, 0, 8, 128);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        for (let y = 0; y < 128; y += 32) ctx.fillRect(0, y, 128, 3);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 24);
        return tex;
      },

      createHazardTexture() {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ef233c';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffe7ac';
        for (let i = -128; i < 256; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 14, 0);
          ctx.lineTo(i + 78, 128);
          ctx.lineTo(i + 64, 128);
          ctx.closePath();
          ctx.fill();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1.2, 1.2);
        return tex;
      },

      createFruitHero() {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0xff8c5a,
          roughness: 0.25,
          metalness: 0.08,
          emissive: 0xff5a1f,
          emissiveIntensity: 0.12
        });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 28), bodyMat);
        body.castShadow = true;
        group.add(body);

        // Cheek blush
        const blushMat = new THREE.MeshBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.55 });
        [-0.22, 0.22].forEach(x => {
          const blush = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), blushMat);
          blush.scale.set(1.2, 0.65, 0.4);
          blush.position.set(x, -0.02, 0.36);
          group.add(blush);
        });

        // Stem & Leaf
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.042, 0.18, 8),
          this.enamel(0x5c3a21)
        );
        stem.position.set(0, 0.46, 0);
        stem.rotation.z = -0.14;
        group.add(stem);

        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 10, 10),
          this.enamel(0x2ec4b6, 0x06d6a0, 0.2)
        );
        leaf.scale.set(1.5, 0.45, 0.8);
        leaf.position.set(0.12, 0.48, 0.02);
        leaf.rotation.z = 0.35;
        group.add(leaf);

        // Expressive Eyes
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const irisMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
        [-0.14, 0.14].forEach(x => {
          const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), whiteMat);
          eyeW.position.set(x, 0.1, 0.35);
          group.add(eyeW);
          const iris = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), irisMat);
          iris.position.set(x, 0.1, 0.41);
          group.add(iris);
          const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), pupilMat);
          pupil.position.set(x, 0.1, 0.44);
          group.add(pupil);
        });

        // Smile
        const mouth = new THREE.Mesh(
          new THREE.TorusGeometry(0.085, 0.022, 8, 16, Math.PI),
          pupilMat
        );
        mouth.position.set(0, -0.02, 0.38);
        mouth.rotation.z = Math.PI;
        group.add(mouth);

        // Super-Smash / Drill Aura Ring
        const aura = new THREE.Mesh(
          new THREE.TorusGeometry(0.56, 0.045, 10, 28),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0 })
        );
        aura.rotation.x = Math.PI / 2;
        group.add(aura);

        group.userData = { body, bodyMat, aura };
        return group;
      },

      createPickupModel(type) {
        const g = new THREE.Group();
        if (type === 'apple') {
          const red = this.enamel(0xef233c, 0x9b111e, 0.2);
          const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), red);
          const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), red);
          l1.position.x = -0.09; l2.position.x = 0.09;
          l1.scale.y = 1.08; l2.scale.y = 1.08;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.18, 6), this.enamel(0x5c3a21));
          stem.position.y = 0.28;
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), this.enamel(0x22c55e));
          leaf.scale.set(1.4, 0.4, 0.8);
          leaf.position.set(0.1, 0.3, 0);
          leaf.rotation.z = 0.4;
          g.add(l1, l2, stem, leaf);
        } else if (type === 'banana') {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.22, 0.24, 0),
            new THREE.Vector3(-0.08, 0.0, 0),
            new THREE.Vector3(0.18, -0.18, 0)
          ]);
          const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 16, 0.095, 10, false),
            this.enamel(0xfde047, 0xf59e0b, 0.22)
          );
          const tip1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), this.enamel(0x713f12));
          tip1.position.set(-0.22, 0.24, 0);
          const tip2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), this.enamel(0x713f12));
          tip2.position.set(0.18, -0.18, 0);
          g.add(tube, tip1, tip2);
        } else if (type === 'choco') {
          const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.58, 0.14),
            this.enamel(0x5c3317, 0x3b1f0e, 0.18)
          );
          g.add(base);
          const sqMat = this.enamel(0x7b4420);
          for (let r = -1; r <= 1; r++) {
            for (let c = -0.5; c <= 0.5; c += 1) {
              const sq = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.08), sqMat);
              sq.position.set(c * 0.2, r * 0.17, 0.06);
              g.add(sq);
            }
          }
          g.rotation.z = -0.2;
        } else if (type === 'diamond') {
          const gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.36, 0),
            new THREE.MeshPhongMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 0.45,
              shininess: 140,
              flatShading: true
            })
          );
          g.add(gem);
        } else if (type === 'rotten') {
          const blob = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.28, 0),
            this.enamel(0x65a30d, 0x365314, 0.35)
          );
          const fume = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xa3e635, transparent: true, opacity: 0.65 })
          );
          fume.position.set(0.14, 0.32, 0);
          g.add(blob, fume);
        } else {
          // Cockroach
          const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 12, 12),
            this.enamel(0x3f2305, 0x1c1917, 0.2)
          );
          shell.scale.set(0.8, 0.55, 1.45);
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
          [-0.08, 0.08].forEach(x => {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
            e.position.set(x, 0.06, 0.3);
            g.add(e);
          });
          g.add(shell);
        }
        return g;
      },

      createEnemyModel(type, level) {
        const g = new THREE.Group();
        if (type === 'monster') {
          const colors = { 1: 0x32cd32, 2: 0x22c55e, 3: 0x8a2be2, 4: 0xff8c00, 5: 0xff4500, 6: 0x9333ea };
          const scale = level >= 5 ? 1.15 : 1.0;
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.56 * scale, 0.56 * scale, 0.56 * scale),
            this.enamel(colors[level] || 0x32cd32, 0x111111, 0.15)
          );
          body.castShadow = true;
          g.add(body);
          const hornMat = this.enamel(0xfef08a);
          [-0.2, 0.2].forEach(x => {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), hornMat);
            horn.position.set(x, 0.38 * scale, 0);
            horn.rotation.z = x < 0 ? 0.3 : -0.3;
            g.add(horn);
          });
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
          [-0.13, 0.13].forEach(x => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), eyeMat);
            eye.position.set(x, 0.08, 0.28 * scale);
            g.add(eye);
          });
        } else if (type === 'bat') {
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), this.enamel(0x1f2937));
          g.add(body);
          const wingMat = this.enamel(0x374151);
          const wL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 4), wingMat);
          wL.rotation.z = Math.PI / 2;
          wL.position.x = -0.36;
          const wR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 4), wingMat);
          wR.rotation.z = -Math.PI / 2;
          wR.position.x = 0.36;
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          [-0.08, 0.08].forEach(x => {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
            e.position.set(x, 0.06, 0.21);
            g.add(e);
          });
          g.add(wL, wR);
          g.userData = { wL, wR };
        } else {
          // Flying Ghost (Level 6 Finale)
          const ghostMat = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 0.85
          });
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), ghostMat);
          head.position.y = 0.16;
          const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.52, 12), ghostMat);
          skirt.position.y = -0.1;
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
          [-0.1, 0.1].forEach(x => {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), eyeMat);
            e.position.set(x, 0.2, 0.24);
            g.add(e);
          });
          g.add(head, skirt);
        }
        return g;
      }
    };

    // =========================================================================
