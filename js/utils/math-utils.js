/**
 * Math Utilities - Utilitários matemáticos para o jogo
 * 
 * Funções auxiliares para cálculos matemáticos comuns:
 * - Distâncias e vetores
 * - Interpolação e animação
 * - Transformações 3D
 * - Física básica
 */

// Utilitários de vetor
const VectorUtils = {
    /**
     * Calcula a distância entre dois pontos 3D
     */
    distance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    /**
     * Normaliza um vetor
     */
    normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
    },

    /**
     * Produto escalar entre dois vetores
     */
    dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    },

    /**
     * Produto vetorial entre dois vetores
     */
    cross(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    },

    /**
     * Interpola linearmente entre dois vetores
     */
    lerp(v1, v2, t) {
        return {
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t,
            z: v1.z + (v2.z - v1.z) * t
        };
    }
};

// Utilitários de interpolação
const InterpolationUtils = {
    /**
     * Interpolação linear
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Interpolação suave (ease-in-out)
     */
    smoothstep(start, end, t) {
        t = Math.max(0, Math.min(1, t));
        t = t * t * (3 - 2 * t);
        return start + (end - start) * t;
    },

    /**
     * Interpolação com bounce
     */
    bounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    },

    /**
     * Interpolação elástica
     */
    elastic(t) {
        return Math.sin(-13 * Math.PI / 2 * (t + 1)) * Math.pow(2, -10 * t) + 1;
    }
};

// Utilitários de transformação
const TransformUtils = {
    /**
     * Converte graus para radianos
     */
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Converte radianos para graus
     */
    radToDeg(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Clamp um valor entre min e max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Mapeia um valor de um range para outro
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Gera número aleatório entre min e max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Gera número inteiro aleatório entre min e max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// Utilitários de física
const PhysicsUtils = {
    /**
     * Calcula velocidade baseada na distância e tempo
     */
    calculateVelocity(distance, time) {
        return distance / time;
    },

    /**
     * Calcula trajetória parabólica
     */
    calculateParabolicTrajectory(startPos, targetPos, gravity = -9.8, timeStep = 0.1) {
        const trajectory = [];
        const distance = VectorUtils.distance(startPos, targetPos);
        const angle = Math.atan2(targetPos.y - startPos.y, distance);
        
        const initialVelocity = Math.sqrt(distance * Math.abs(gravity) / Math.sin(2 * angle));
        const vx = initialVelocity * Math.cos(angle);
        const vy = initialVelocity * Math.sin(angle);
        
        let t = 0;
        let currentPos = { ...startPos };
        
        while (currentPos.y >= targetPos.y && t < 10) { // Máximo 10 segundos
            trajectory.push({ ...currentPos });
            
            t += timeStep;
            currentPos.x = startPos.x + vx * t;
            currentPos.y = startPos.y + vy * t + 0.5 * gravity * t * t;
            currentPos.z = startPos.z;
        }
        
        return trajectory;
    },

    /**
     * Verifica colisão entre duas esferas
     */
    sphereCollision(pos1, radius1, pos2, radius2) {
        const distance = VectorUtils.distance(pos1, pos2);
        return distance <= (radius1 + radius2);
    },

    /**
     * Verifica se um ponto está dentro de uma caixa (AABB)
     */
    pointInBox(point, boxMin, boxMax) {
        return point.x >= boxMin.x && point.x <= boxMax.x &&
               point.y >= boxMin.y && point.y <= boxMax.y &&
               point.z >= boxMin.z && point.z <= boxMax.z;
    }
};

// Utilitários de animação
const AnimationUtils = {
    /**
     * Cria uma animação suave entre valores
     */
    animate(startValue, endValue, duration, easingFunction = InterpolationUtils.lerp, callback) {
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = easingFunction(startValue, endValue, progress);
            callback(currentValue, progress);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    },

    /**
     * Cria uma animação de rotação suave
     */
    rotateTowards(currentRotation, targetRotation, speed) {
        const diff = {
            x: targetRotation.x - currentRotation.x,
            y: targetRotation.y - currentRotation.y,
            z: targetRotation.z - currentRotation.z
        };

        // Normalizar ângulos para -180 a 180
        Object.keys(diff).forEach(axis => {
            while (diff[axis] > 180) diff[axis] -= 360;
            while (diff[axis] < -180) diff[axis] += 360;
        });

        return {
            x: currentRotation.x + diff.x * speed,
            y: currentRotation.y + diff.y * speed,
            z: currentRotation.z + diff.z * speed
        };
    }
};

// Utilitários de cor
const ColorUtils = {
    /**
     * Converte HSL para RGB
     */
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    /**
     * Interpola entre duas cores
     */
    lerpColor(color1, color2, t) {
        return {
            r: Math.round(InterpolationUtils.lerp(color1.r, color2.r, t)),
            g: Math.round(InterpolationUtils.lerp(color1.g, color2.g, t)),
            b: Math.round(InterpolationUtils.lerp(color1.b, color2.b, t))
        };
    },

    /**
     * Converte cor RGB para string hexadecimal
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};

// Exportar para uso global
window.VectorUtils = VectorUtils;
window.InterpolationUtils = InterpolationUtils;
window.TransformUtils = TransformUtils;
window.PhysicsUtils = PhysicsUtils;
window.AnimationUtils = AnimationUtils;
window.ColorUtils = ColorUtils;

console.log('🧮 Math Utilities carregado');