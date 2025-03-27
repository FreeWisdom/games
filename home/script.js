// Sample game data
const gamesData = [
    {
        id: 0,
        title: "Stickman Ghost Online",
        cover: "https://img.gamemonetize.com/qsd2h427rg6z6gza2xekqsdwgk1dwksa/512x384.jpg", // 使用线上
        videoBackground: "https://gamemonetize.video/video/qsd2h427rg6z6gza2xekqsdwgk1dwksa-1682287965.mp4", // 添加视频背景
        genre: ["action", "adventure"],
        platform: ["mobile", "pc"],
        rating: "5-star",
        releaseDate: "2025-03-27",
        description: "Embark on an epic adventure in Stickman Ghost Online, where you'll transform into a powerful stickman warrior fighting against dark forces. This action-packed adventure game combines intense combat with strategic gameplay as you battle through various levels filled with challenging enemies.",
        features: ["Dynamic combat system", "Collect coins & upgrade", "PC & mobile support", "Multiple levels"],
        gameUrl: "../stickmanghostonlinegame/index.html"
    },
];

// Initialize page on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // 始终开启Three.js背景 - 不再需要切换
    window.bgEnabled = true;
    window.threeJsScene = null;
    
    // Render game cards
    renderGameCards(gamesData);
        
    // Add dropdown event listeners
    document.getElementById('genre-filter').addEventListener('change', filterGames);
    document.getElementById('platform-filter').addEventListener('change', filterGames);
    document.getElementById('rating-filter').addEventListener('change', filterGames);
    document.getElementById('release-filter').addEventListener('change', filterGames);
    
    // Initialize card effects
    initCardEffects();
    
    // Add structured data for SEO
    addStructuredData();

    // 立即初始化背景效果
    initThreeJsBackground();
    
    // 处理视频加载错误
    setTimeout(handleVideoErrors, 500);
});

// Add JSON-LD structured data for SEO
function addStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Pick Free Games",
        "url": "https://pickfreegames.com/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pickfreegames.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        },
        "description": "Discover and download free games across all platforms. Browse games by genre, platform, and user ratings."
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// Initialize Three.js background and return canvas element
function initThreeJsBackground() {
    const container = document.getElementById('bg-container');
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090b14, 0.01); // 保留一点雾效
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = 0;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // 创建文字颜色
    const textColors = [
        new THREE.Color(0x7b2cbf), // 紫色
        new THREE.Color(0x3a86ff), // 蓝色
        new THREE.Color(0xff006e), // 粉色
        new THREE.Color(0xfb5607)  // 橙色
    ];
    
    // 创建文字组
    const textGroup = new THREE.Group();
    scene.add(textGroup);
    
    // 文字动画状态管理
    const textAnimState = {
        fadeDirection: 1, // 1为显示，-1为隐藏
        fadeProgress: 1,  // 从1开始（完全显示）
        fadeSpeed: 1.5,   // 淡出速度 (调高以加快消失)
        fadeInSpeed: 0.8, // 淡入速度 (调低以减缓出现)
        showDuration: 3.0,   // 显示持续时间
        hideDuration: 1.0,   // 隐藏持续时间 (缩短此值)
        timer: 0,
        lastSwitch: 0
    };
    
    // 加载字体
    const fontLoader = new THREE.FontLoader();
    
    // 创建文字材质
    const textMaterials = textColors.map(color => 
        new THREE.MeshPhongMaterial({
            color: color,
            emissive: color.clone().multiplyScalar(0.2),
            specular: 0xffffff,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        })
    );
    
    // 辅助函数: 创建文字网格
    function createTextMesh(font, text, material, size, depth, x, y, z) {
        const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: size,
            height: depth,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
        
        textGeometry.computeBoundingBox();
        const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        
        const textMesh = new THREE.Mesh(textGeometry, material);
        textMesh.position.set(x + centerOffset, y, z);
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;
        
        return textMesh;
    }
    
    // 加载字体并创建文字
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
        // 创建"PICK"文字
        const pickMesh = createTextMesh(font, "PICK", textMaterials[0], 5, 2, 0, 10, 0);
        textGroup.add(pickMesh);
        
        // 创建"FREE"文字
        const freeMesh = createTextMesh(font, "FREE", textMaterials[1], 6, 2, 0, 0, 0);
        textGroup.add(freeMesh);
        
        // 创建"GAMES"文字
        const gamesMesh = createTextMesh(font, "GAMES", textMaterials[2], 5, 2, 0, -10, 0);
        textGroup.add(gamesMesh);
        
        // 居中整个文字组
        textGroup.position.y = 0;
    });
    
    // 添加粒子效果 - 游戏图标和符号
    const symbolsCount = 120;
    const symbols = [];
    const symbolGeometries = [
        new THREE.TetrahedronGeometry(0.8, 0), // 四面体代表动作游戏
        new THREE.OctahedronGeometry(0.8, 0),  // 八面体代表策略游戏
        new THREE.IcosahedronGeometry(0.8, 0),  // 二十面体代表RPG
        new THREE.BoxGeometry(0.8, 0.8, 0.8),  // 方块代表沙盒游戏
        new THREE.TorusGeometry(0.5, 0.2, 8, 16), // 圆环代表竞速游戏
        new THREE.ConeGeometry(0.5, 1, 8)      // 锥体代表射击游戏
    ];
    
    for (let i = 0; i < symbolsCount; i++) {
        // 随机选择几何体
        const geometry = symbolGeometries[Math.floor(Math.random() * symbolGeometries.length)];
        
        // 随机选择颜色
        const material = new THREE.MeshPhongMaterial({
            color: textColors[Math.floor(Math.random() * textColors.length)],
            shininess: 80,
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });
        
        // 创建网格
        const symbol = new THREE.Mesh(geometry, material);
        
        // 随机位置 - 分布在较大范围内
        symbol.position.x = (Math.random() - 0.5) * 120;
        symbol.position.y = (Math.random() - 0.5) * 120;
        symbol.position.z = (Math.random() - 0.5) * 60 - 20;
        
        // 随机旋转
        symbol.rotation.x = Math.random() * Math.PI;
        symbol.rotation.y = Math.random() * Math.PI;
        symbol.rotation.z = Math.random() * Math.PI;
        
        // 随机大小
        const scale = 0.4 + Math.random() * 0.8;
        symbol.scale.set(scale, scale, scale);
        
        // 储存初始位置和随机速度
        symbol.userData = {
            speed: {
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            },
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            initialPosition: symbol.position.clone()
        };
        
        // 添加到场景
        scene.add(symbol);
        symbols.push(symbol);
    }
    
    // 添加光晕效果
    const glowGeometry = new THREE.SphereGeometry(25, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x7b2cbf) },
            color2: { value: new THREE.Color(0x3a86ff) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            
            void main() {
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(vUv, center);
                
                // 创建脉动效果
                float alpha = smoothstep(0.5, 0.0, dist) * (0.3 + 0.2 * sin(time));
                
                // 颜色渐变
                vec3 color = mix(color1, color2, sin(time * 0.5) * 0.5 + 0.5);
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // 添加照明
    const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
    scene.add(ambientLight);
    
    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 20);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    // 辅助光源 - 粉色
    const pinkLight = new THREE.PointLight(0xff006e, 1, 50);
    pinkLight.position.set(-15, 5, 15);
    scene.add(pinkLight);
    
    // 辅助光源 - 蓝色
    const blueLight = new THREE.PointLight(0x3a86ff, 1, 50);
    blueLight.position.set(15, -5, 15);
    scene.add(blueLight);
    
    // 追踪鼠标位置
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2);
    });
    
    // 动画函数
    function animate() {
        requestAnimationFrame(animate);
        
        // 更新时间
        const time = Date.now() * 0.001;
        const deltaTime = 1/60; // 假设60fps
        
        // 更新光晕shader的时间
        if (glowMaterial.uniforms) {
            glowMaterial.uniforms.time.value = time;
        }
        
        // 文字组动画 - 加入淡入淡出效果
        if (textGroup && textGroup.children.length > 0) {
            // 更新淡入淡出计时器
            textAnimState.timer += deltaTime;
            
            // 决定是否应该切换淡入/淡出状态
            if (textAnimState.fadeDirection > 0 && 
                textAnimState.timer - textAnimState.lastSwitch > textAnimState.showDuration) {
                textAnimState.fadeDirection = -1; // 开始淡出
                textAnimState.lastSwitch = textAnimState.timer;
            } else if (textAnimState.fadeDirection < 0 && 
                       textAnimState.timer - textAnimState.lastSwitch > textAnimState.hideDuration) {
                textAnimState.fadeDirection = 1; // 开始淡入
                textAnimState.lastSwitch = textAnimState.timer;
            }
            
            // 更新淡入淡出进度
            const fadeSpeed = textAnimState.fadeDirection > 0 ? 
                             textAnimState.fadeInSpeed : textAnimState.fadeSpeed;
            textAnimState.fadeProgress += textAnimState.fadeDirection * fadeSpeed * deltaTime;
            textAnimState.fadeProgress = Math.max(0, Math.min(1, textAnimState.fadeProgress));
            
            // 应用淡入淡出效果 - 使用缓动函数使过渡更平滑
            const easedFade = easeInOutCubic(textAnimState.fadeProgress);
            
            // 文字组基本动画
            textGroup.position.y = Math.sin(time * 0.5) * 1.5;
            textGroup.rotation.x = Math.sin(time * 0.3) * 0.05;
            textGroup.rotation.y = Math.sin(time * 0.4) * 0.05;
            
            // 应用透明度和缩放效果
            textGroup.children.forEach((child, index) => {
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.opacity = easedFade * 0.9;
                        });
                    } else {
                        child.material.opacity = easedFade * 0.9;
                    }
                }
                
                // 缩放效果随透明度变化
                const baseScale = easedFade * 0.2 + 0.8; // 0.8到1.0之间
                const pulseScale = baseScale + Math.sin(time * 0.8 + index * 0.6) * 0.05 * easedFade;
                child.scale.set(pulseScale, pulseScale, pulseScale);
                
                // 添加进入和退出的缩放/旋转效果
                if (textAnimState.fadeDirection < 0) {
                    // 淡出时稍微旋转并缩小
                    child.rotation.y = Math.sin(time * 0.4 + index) * 0.1 + (1 - easedFade) * 0.2;
                    child.position.z = (1 - easedFade) * -2;
                } else {
                    // 淡入时从侧面旋转进入
                    child.rotation.y = Math.sin(time * 0.4 + index) * 0.1 * easedFade + (1 - easedFade) * -0.5;
                    child.position.z = (1 - easedFade) * 5;
                }
            });
        }
        
        // 更新游戏符号
        symbols.forEach(symbol => {
            // 应用速度
            symbol.position.x += symbol.userData.speed.x;
            symbol.position.y += symbol.userData.speed.y;
            symbol.position.z += symbol.userData.speed.z;
            
            // 应用旋转
            symbol.rotation.x += symbol.userData.rotationSpeed.x;
            symbol.rotation.y += symbol.userData.rotationSpeed.y;
            symbol.rotation.z += symbol.userData.rotationSpeed.z;
            
            // 检查边界并重置位置
            const boundsX = 60;
            const boundsY = 60;
            const boundsZ = 30;
            
            if (Math.abs(symbol.position.x) > boundsX) {
                symbol.position.x *= -0.9;
            }
            
            if (Math.abs(symbol.position.y) > boundsY) {
                symbol.position.y *= -0.9;
            }
            
            if (symbol.position.z < -boundsZ || symbol.position.z > 10) {
                symbol.position.z *= -0.9;
            }
        });
        
        // 更新灯光
        pinkLight.intensity = 0.8 + Math.sin(time * 1.3) * 0.2;
        blueLight.intensity = 0.8 + Math.sin(time * 1.7) * 0.2;
        
        // 相机响应鼠标移动
        camera.position.x += (mouseX * 0.01 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.01 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    // 缓动函数使过渡更平滑
    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
    
    return renderer.domElement;
}

// 添加全局变量存储当前筛选器状态
let currentFilters = {
    genre: 'all',
    platform: 'all',
    rating: 'all',
    release: 'all'
};

// Render game cards
function renderGameCards(games) {
    const gamesGrid = document.getElementById('games-grid');
    gamesGrid.innerHTML = '';
    
    // Add title card with animated text
    const titleCard = document.createElement('div');
    titleCard.className = 'title-card';
    
    // 创建动画文字
    const titleText = "Pick Free Games";
    let animatedTitle = '<h1 class="animated-title">';
    
    // 将标题拆分为单个字母，每个字母用span包装
    for (let i = 0; i < titleText.length; i++) {
        const char = titleText.charAt(i);
        if (char === ' ') {
            animatedTitle += '<span class="space">&nbsp;</span>';
        } else {
            // 为每个字母添加不同的延迟和随机颜色类
            const colorClass = getRandomColorClass();
            const delay = (i * 0.05).toFixed(2); // 延迟递增，创造波浪效果
            animatedTitle += `<span class="animated-char ${colorClass}" style="animation-delay: ${delay}s; -webkit-animation-delay: ${delay}s;">${char}</span>`;
        }
    }
    
    animatedTitle += '</h1>';
    
    titleCard.innerHTML = `
        ${animatedTitle}
        <div class="filter-container">
            <div class="filter-group">
                <label for="genre-filter">Genre</label>
                <select id="genre-filter">
                    <option value="" ${currentFilters.genre === '' ? 'selected' : ''}>All</option>
                    <option value="3d" ${currentFilters.genre === '3d' ? 'selected' : ''}>3D</option>
                    <option value="action" ${currentFilters.genre === 'action' ? 'selected' : ''}>Action</option>
                    <option value="adventure" ${currentFilters.genre === 'adventure' ? 'selected' : ''}>Adventure</option>
                    <option value="arcade" ${currentFilters.genre === 'arcade' ? 'selected' : ''}>Arcade</option>
                    <option value="baby" ${currentFilters.genre === 'baby' ? 'selected' : ''}>Baby</option>
                    <option value="bejeweled" ${currentFilters.genre === 'bejeweled' ? 'selected' : ''}>Bejeweled</option>
                    <option value="boys" ${currentFilters.genre === 'boys' ? 'selected' : ''}>Boys</option>
                    <option value="clicker" ${currentFilters.genre === 'clicker' ? 'selected' : ''}>Clicker</option>
                    <option value="cooking" ${currentFilters.genre === 'cooking' ? 'selected' : ''}>Cooking</option>
                    <option value="girls" ${currentFilters.genre === 'girls' ? 'selected' : ''}>Girls</option>
                    <option value="haze" ${currentFilters.genre === 'haze' ? 'selected' : ''}>Haze</option>
                    <option value="hypercasual" ${currentFilters.genre === 'hypercasual' ? 'selected' : ''}>Hypercasual</option>
                    <option value="io" ${currentFilters.genre === 'io' ? 'selected' : ''}>IO</option>
                    <option value="multiplayer" ${currentFilters.genre === 'multiplayer' ? 'selected' : ''}>Multiplayer</option>
                    <option value="player" ${currentFilters.genre === 'player' ? 'selected' : ''}>Player</option>
                    <option value="puzzle" ${currentFilters.genre === 'puzzle' ? 'selected' : ''}>Puzzle</option>
                    <option value="racing" ${currentFilters.genre === 'racing' ? 'selected' : ''}>Racing</option>
                    <option value="shooting" ${currentFilters.genre === 'shooting' ? 'selected' : ''}>Shooting</option>
                    <option value="soccer" ${currentFilters.genre === 'soccer' ? 'selected' : ''}>Soccer</option>
                    <option value="sports" ${currentFilters.genre === 'sports' ? 'selected' : ''}>Sports</option>
                    <option value="stickman" ${currentFilters.genre === 'stickman' ? 'selected' : ''}>Stickman</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="platform-filter">Platform</label>
                <select id="platform-filter">
                    <option value="" ${currentFilters.platform === '' ? 'selected' : ''}>All</option>
                    <option value="pc" ${currentFilters.platform === 'pc' ? 'selected' : ''}>PC</option>
                    <option value="mobile" ${currentFilters.platform === 'mobile' ? 'selected' : ''}>Mobile</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="rating-filter">Rating</label>
                <select id="rating-filter">
                    <option value="" ${currentFilters.rating === '' ? 'selected' : ''}>All</option>
                    <option value="1-star" ${currentFilters.rating === '1-star' ? 'selected' : ''}>★</option>
                    <option value="2-star" ${currentFilters.rating === '2-star' ? 'selected' : ''}>★★</option>
                    <option value="3-star" ${currentFilters.rating === '3-star' ? 'selected' : ''}>★★★</option>
                    <option value="4-star" ${currentFilters.rating === '4-star' ? 'selected' : ''}>★★★★</option>
                    <option value="5-star" ${currentFilters.rating === '5-star' ? 'selected' : ''}>★★★★★</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="release-filter">Release</label>
                <select id="release-filter">
                    <option value="" ${currentFilters.release === '' ? 'selected' : ''}>All</option>
                    <option value="new" ${currentFilters.release === 'new' ? 'selected' : ''}>Latest</option>
                    <option value="month" ${currentFilters.release === 'month' ? 'selected' : ''}>30 Days</option>
                    <option value="year" ${currentFilters.release === 'year' ? 'selected' : ''}>This Year</option>
                </select>
            </div>
        </div>
    `;
    gamesGrid.appendChild(titleCard);
    
    // Add game cards with optimized size distribution
    games.forEach((game, index) => {
        const gameCard = document.createElement('div');
        
        // 优化卡片尺寸分配逻辑，使瀑布流更加紧凑
        let sizeClass = '';
        
        // 更多使用小尺寸卡片，减少大尺寸卡片的比例
        const sizePattern = index % 16; // 扩展周期模式以获得更多变化
        
        if (game.rating === "5-star") {
            // 只有非常高评分的游戏才使用大卡片
            sizeClass = 'size-large';
        } else if (sizePattern === 0) {
            // 只在第1个位置使用宽卡片
            sizeClass = 'size-wide';
        } else if (sizePattern === 8) {
            // 只在第9个位置使用高卡片
            sizeClass = 'size-tall';
        } else if (sizePattern === 12 && game.rating === "4-star") {
            // 第13个位置且评分高的游戏使用中等卡片
            sizeClass = 'size-medium';
        } else {
            // 大多数使用小卡片
            sizeClass = 'size-small';
        }
        
        // 某些特定类型的游戏可能需要更大尺寸
        if (game.genre === 'rpg' && game.rating === "4-star" && sizeClass === 'size-small') {
            // 高评分RPG游戏至少使用中等卡片
            sizeClass = 'size-medium';
        }
        
        gameCard.className = `game-card ${sizeClass}`;
        gameCard.setAttribute('data-game-id', game.id);
        
        // 为第一个游戏卡片始终使用图片背景
        const useVideoBackground = false; // 禁用视频背景
        const coverImage = game.cover; // game.cover背景      
        // 使用游戏本身的标题
        const gameTitle = game.title;
        
        // 构建完整的游戏卡片，前后两面都包含必要信息
        const frontContent = useVideoBackground ? 
            `<div class="game-card-front">
                <video autoplay muted loop playsinline class="video-background" poster="${coverImage}">
                    <source src="${game.videoBackground}" type="video/mp4">
                </video>
                <div class="screenshot-overlay"></div>
                <div class="bottom-gradient"></div>
                <div class="game-screenshots">
                    <div class="screenshot-item" style="background-image: url('https://source.unsplash.com/random/300x200?${game.genre},gameplay')"></div>
                    <div class="screenshot-item" style="background-image: url('https://source.unsplash.com/random/300x200?${game.genre},game,screenshot')"></div>
                </div>
                <h3 class="game-card-title">${gameTitle}</h3>
            </div>` :
            `<div class="game-card-front" style="background-image: url('${coverImage}')">
                <div class="screenshot-overlay"></div>
                <div class="bottom-gradient"></div>
                <div class="game-screenshots">
                    <div class="screenshot-item" style="background-image: url('https://source.unsplash.com/random/300x200?${game.genre},gameplay')"></div>
                    <div class="screenshot-item" style="background-image: url('https://source.unsplash.com/random/300x200?${game.genre},game,screenshot')"></div>
                </div>
                <h3 class="game-card-title">${gameTitle}</h3>
            </div>`;
        
        gameCard.innerHTML = `
            <div class="game-card-inner">
                ${frontContent}
                <div class="game-card-back">
                    ${game.videoBackground ? `
                    <video class="back-video-background" muted loop playsinline poster="${coverImage}">
                        <source src="${game.videoBackground}" type="video/mp4">
                    </video>
                    <div class="back-overlay"></div>
                    ` : ''}
                    <h3>${gameTitle}</h3>
                    
                    <!-- 基本信息（所有卡片都显示） -->
                    <div class="game-info">
                        <p><strong>${getGenreName(game.genre)}</strong></p>
                        <div class="game-rating">
                            <span>${typeof game.rating === 'string' ? 
                                '★'.repeat(Number(game.rating.split('-')[0])) : 
                                '★'.repeat(Math.round(game.rating))}</span>
                        </div>
                    </div>
                    
                    <!-- 发布日期（所有卡片都显示） -->
                    <p class="card-release-date"><small>发布日期: ${formatDate(game.releaseDate)}</small></p>
                    
                    <!-- 小卡片显示的内容 -->
                    ${sizeClass === 'size-small' ? `
                    <div class="game-description">
                        ${game.description.length > 60 ? game.description.substring(0, 60) + '...' : game.description}
                    </div>
                    ` : ''}
                    
                    <!-- 中型卡片显示的内容 -->
                    ${sizeClass === 'size-medium' ? `
                    <div class="game-description">
                        ${game.description.length > 80 ? game.description.substring(0, 80) + '...' : game.description}
                    </div>
                    <div class="game-features">
                        ${game.features.slice(0, 2).map(feature => `<span>#${feature}</span>`).join('')}
                        ${game.features.length > 2 ? '<span>+' + (game.features.length - 2) + '</span>' : ''}
                    </div>
                    ` : ''}
                    
                    <!-- 大型卡片显示的内容 -->
                    ${(sizeClass === 'size-large' || sizeClass === 'size-tall' || sizeClass === 'size-wide') ? `
                    <div class="game-description">
                        ${game.description.length > 120 ? game.description.substring(0, 120) + '...' : game.description}
                    </div>
                    <div class="game-features">
                        ${game.features.slice(0, 4).map(feature => `<span>#${feature}</span>`).join('')}
                        ${game.features.length > 4 ? '<span>+' + (game.features.length - 4) + '</span>' : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        gamesGrid.appendChild(gameCard);
    });
    
    // Re-add event listeners
    document.getElementById('genre-filter').addEventListener('change', filterGames);
    document.getElementById('platform-filter').addEventListener('change', filterGames);
    document.getElementById('rating-filter').addEventListener('change', filterGames);
    document.getElementById('release-filter').addEventListener('change', filterGames);
    
    // Re-initialize card effects
    initCardEffects();
    
    // 添加鼠标悬停时播放背面视频的功能
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const backVideo = card.querySelector('.back-video-background');
        if (backVideo) {
            card.addEventListener('mouseenter', () => {
                backVideo.play();
            });
            
            card.addEventListener('mouseleave', () => {
                backVideo.pause();
                backVideo.currentTime = 0;
            });
        }
        
        // 添加游戏卡片点击事件
        card.addEventListener('click', () => {
            const gameId = card.getAttribute('data-game-id');
            const game = games.find(g => g.id == gameId);
            
            if (game && game.gameUrl) {
                // 如果游戏有URL属性，跳转到该URL
                window.open(game.gameUrl, '_blank');
            }
        });
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
}

// Get genre name
function getGenreName(genre) {
    const genres = {
        'action': 'Action',
        'adventure': 'Adventure',
        'rpg': 'RPG',
        'strategy': 'Strategy',
        'simulation': 'Simulation',
        'sports': 'Sports'
    };
    return genres[genre] || genre;
}

// Get platform name
function getPlatformName(platform) {
    const platforms = {
        'pc': 'PC',
        'ps5': 'PS5',
        'xbox': 'Xbox',
        'switch': 'Switch',
        'mobile': 'Mobile'
    };
    return platforms[platform] || platform;
}

// Filter games
function filterGames() {
    const genreFilter = document.getElementById('genre-filter').value;
    const platformFilter = document.getElementById('platform-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;
    const releaseFilter = document.getElementById('release-filter').value;
    
    // 更新全局筛选器状态
    currentFilters = {
        genre: genreFilter,
        platform: platformFilter,
        rating: ratingFilter,
        release: releaseFilter
    };
    
    // 打印当前选择的值，用于调试
    console.log("当前筛选器状态:", currentFilters);
    
    let filteredGames = [...gamesData];
    
    if (genreFilter) {
        filteredGames = filteredGames.filter(game => game.genre.includes(genreFilter));
    }
    
    if (platformFilter) {
        filteredGames = filteredGames.filter(game => game.platform.includes(platformFilter));
    }
    
    if (ratingFilter) {
        filteredGames = filteredGames.filter(game => game.rating.includes(ratingFilter));
    }
    
    if (releaseFilter) {
        const now = new Date();
        if (releaseFilter === 'new') {
            filteredGames = filteredGames.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        } else if (releaseFilter === 'month') {
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            filteredGames = filteredGames.filter(game => new Date(game.releaseDate) >= oneMonthAgo);
        } else if (releaseFilter === 'year') {
            const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            filteredGames = filteredGames.filter(game => new Date(game.releaseDate) >= oneYearAgo);
        }
    }
    
    renderGameCards(filteredGames);
}

// Initialize card effects
function initCardEffects() {
    // Add particle effect to title card
    const titleCard = document.querySelector('.title-card');
    if (titleCard) {
        // Add particles to title card
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random starting position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            
            // Random movement direction
            const tx = (Math.random() - 0.5) * 100;
            const ty = (Math.random() - 0.5) * 100;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            // Random delay
            particle.style.animationDelay = `${Math.random() * 2}s`;
            
            titleCard.appendChild(particle);
        }
        
        // Add hover glow effect
        titleCard.addEventListener('mouseenter', () => {
            titleCard.querySelectorAll('.particle').forEach(p => {
                p.style.animationPlayState = 'running';
            });
        });
        
        titleCard.addEventListener('mouseleave', () => {
            setTimeout(() => {
                titleCard.querySelectorAll('.particle').forEach(p => {
                    p.style.animationPlayState = 'running';
                });
            }, 1000);
        });
    }
}

// 添加辅助函数，获取随机颜色类
function getRandomColorClass() {
    const colorClasses = ['char-purple', 'char-blue', 'char-pink', 'char-orange'];
    return colorClasses[Math.floor(Math.random() * colorClasses.length)];
}

// 处理视频加载错误的函数
function handleVideoErrors() {
    const videos = document.querySelectorAll('.video-background, .back-video-background');
    videos.forEach(video => {
        video.addEventListener('error', function(e) {
            console.log('视频加载错误', e);
            // 如果视频加载失败，使用背景图片替代
            const card = this.closest('.game-card-front, .game-card-back');
            if (card) {
                card.style.backgroundImage = `url('${this.getAttribute('poster')}')`;
                this.style.display = 'none';
            }
        });
        
        // 确保视频元素也有直接的onerror处理
        video.onerror = function() {
            const card = this.closest('.game-card-front, .game-card-back');
            if (card) {
                card.style.backgroundImage = `url('${this.getAttribute('poster')}')`;
                this.style.display = 'none';
            }
        };
    });
} 