import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroOverlay({ onComplete }) {
    const [introActive, setIntroActive] = useState(true);
    const [showSkip, setShowSkip] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    const brandLetters = "RUSH _ JEWELS".split("");

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const hasPlayed = sessionStorage.getItem('rush_intro_played');
        if (hasPlayed) {
            handleComplete();
            return;
        }

        // ── 3D Canvas Particle Vortex ──
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let animationFrameId;

            const resizeCanvas = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Shimmering gold particles
            const particleCount = 130;
            const particles = [];
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x3d: Math.random() * 500 - 250,
                    y3d: Math.random() * 500 - 250,
                    z3d: Math.random() * 700 + 100,
                    speed: Math.random() * 0.012 + 0.005,
                    size: Math.random() * 1.5 + 1.2,
                    color: Math.random() > 0.4 ? '#d4a96a' : '#f59e0b', // Luxury amber & gold
                    alpha: Math.random() * 0.6 + 0.4
                });
            }

            let targetX = 0;
            let targetY = 0;
            const trackMouse = (e) => {
                targetX = (e.clientX - window.innerWidth / 2) * 0.05;
                targetY = (e.clientY - window.innerHeight / 2) * 0.05;
            };
            window.addEventListener('mousemove', trackMouse);

            const render = () => {
                ctx.fillStyle = '#050507';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Central glow highlight
                const centerGlow = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, 350
                );
                centerGlow.addColorStop(0, 'rgba(212, 169, 106, 0.08)');
                centerGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.02)');
                centerGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = centerGlow;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                particles.forEach(p => {
                    const cosVal = Math.cos(p.speed);
                    const sinVal = Math.sin(p.speed);
                    const rotX = p.x3d * cosVal - p.z3d * sinVal;
                    const rotZ = p.x3d * sinVal + p.z3d * cosVal;
                    
                    p.x3d = rotX;
                    p.z3d = rotZ;

                    p.x3d += (targetX - p.x3d * 0.01) * 0.01;
                    p.y3d += (targetY - p.y3d * 0.01) * 0.01;

                    const fov = 350;
                    const scale = fov / (fov + p.z3d);
                    const projX = p.x3d * scale + canvas.width / 2;
                    const projY = p.y3d * scale + canvas.height / 2;
                    const projSize = p.size * scale * 2.2;

                    if (projX >= 0 && projX <= canvas.width && projY >= 0 && projY <= canvas.height) {
                        ctx.beginPath();
                        ctx.arc(projX, projY, Math.max(0.6, projSize), 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = p.alpha * scale;
                        ctx.fill();
                    }
                });

                ctx.globalAlpha = 1.0;
                animationFrameId = requestAnimationFrame(render);
            };
            render();

            return () => {
                window.removeEventListener('resize', resizeCanvas);
                window.removeEventListener('mousemove', trackMouse);
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, []);

    // Mouse track for dynamic ambient background gradient
    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        
        const skipTimer = setTimeout(() => setShowSkip(true), 1200);

        const mainTimer = setTimeout(() => {
            setIntroActive(false);
            setTimeout(handleComplete, 1000);
        }, 5200);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(skipTimer);
            clearTimeout(mainTimer);
        };
    }, []);

    const handleComplete = () => {
        sessionStorage.setItem('rush_intro_played', 'true');
        document.body.style.overflow = 'unset';
        onComplete();
    };

    if (sessionStorage.getItem('rush_intro_played') === 'true') {
        return null;
    }

    return (
        <AnimatePresence>
            {introActive && (
                <motion.div
                    id="luxury-intro-container"
                    initial={{ opacity: 1 }}
                    exit={{ 
                        y: '-100vh',
                        opacity: 0,
                        transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } 
                    }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 999999,
                        // Interactive dark luxury radial gradient
                        background: `radial-gradient(circle at ${50 + mousePos.x * 2}% ${50 + mousePos.y * 2}%, rgba(212, 169, 106, 0.08) 0%, #060608 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <style>{`
                        /* Floating Logo & Content Group (No panel/borders) */
                        .logo-content-group {
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 28px;
                            transform-style: preserve-3d;
                            perspective: 1000px;
                            z-index: 20;
                        }
                    `}</style>

                    {/* Canvas Background (Gold Particle Vortex) */}
                    <canvas 
                        ref={canvasRef} 
                        style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }} 
                    />

                    {/* Skip Button */}
                    {showSkip && (
                        <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                setIntroActive(false);
                                setTimeout(handleComplete, 800);
                            }}
                            style={{
                                position: 'fixed', top: '28px', right: '28px', zIndex: 1000000,
                                padding: '10px 22px', borderRadius: '999px',
                                border: '1px solid rgba(212, 169, 106, 0.35)',
                                background: 'rgba(5, 5, 7, 0.85)',
                                backdropFilter: 'blur(16px)',
                                color: '#d4a96a', fontSize: '10px', fontWeight: '700',
                                letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(212, 169, 106, 0.1)'
                            }}
                            whileHover={{ 
                                borderColor: '#d4a96a',
                                color: '#ffffff',
                                backgroundColor: '#d4a96a'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Skip Intro
                        </motion.button>
                    )}

                    {/* Centered Floating Content (No Box) */}
                    <motion.div 
                        className="logo-content-group"
                        style={{
                            transform: `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
                            transition: 'transform 0.15s ease-out'
                        }}
                    >
                        
                        {/* ── Official Monogram SVG (With Glow Backdrop) ── */}
                        <div style={{ position: 'relative', width: '130px', height: '130px', transform: 'translateZ(30px)' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                                <defs>
                                    <filter id="gold-glow">
                                        <feGaussianBlur stdDeviation="1.5" result="blur"/>
                                        <feMerge>
                                            <feMergeNode in="blur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Soft glowing halo behind logo to make it pop */}
                                <circle cx="50" cy="50" r="32" fill="rgba(212, 169, 106, 0.08)" filter="url(#gold-glow)" />

                                {/* 1. Left interlocking leaf curve loop */}
                                <motion.path
                                    d="M 38,42 C 25,50 25,70 50,85 C 58,74 62,60 56,46"
                                    fill="none"
                                    stroke="#d4a96a"
                                    strokeWidth="2.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                                    style={{ filter: 'url(#gold-glow)', strokeLinecap: 'round' }}
                                />

                                {/* 2. Right interlocking leaf curve loop */}
                                <motion.path
                                    d="M 63,58 C 75,50 75,30 50,15 C 42,26 38,40 44,54"
                                    fill="none"
                                    stroke="#d4a96a"
                                    strokeWidth="2.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
                                    style={{ filter: 'url(#gold-glow)', strokeLinecap: 'round' }}
                                />

                                {/* 3. Center Monogram 'N' */}
                                <motion.path 
                                    d="M 45,43 L 45,61"
                                    fill="none" stroke="#eab308" strokeWidth="2.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6, delay: 1.8 }}
                                    style={{ filter: 'url(#gold-glow)' }}
                                />
                                <motion.path 
                                    d="M 45,43 L 55,61"
                                    fill="none" stroke="#eab308" strokeWidth="2.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.8, delay: 2.2 }}
                                    style={{ filter: 'url(#gold-glow)' }}
                                />
                                <motion.path 
                                    d="M 55,43 L 55,61"
                                    fill="none" stroke="#eab308" strokeWidth="2.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.6, delay: 2.7 }}
                                    style={{ filter: 'url(#gold-glow)' }}
                                />

                                {/* Glitter sparkles */}
                                <motion.circle 
                                    cx="50" cy="15" r="2.2" fill="#ffffff"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 2.4 }}
                                    style={{ transformOrigin: '50px 15px', filter: 'drop-shadow(0 0 5px #fff)' }}
                                />
                                <motion.circle 
                                    cx="50" cy="85" r="2.2" fill="#ffffff"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 2.9 }}
                                    style={{ transformOrigin: '50px 85px', filter: 'drop-shadow(0 0 5px #fff)' }}
                                />
                            </svg>
                        </div>

                        {/* ── Official Branding Wordmark ── */}
                        <div style={{ transform: 'translateZ(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                {brandLetters.map((char, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ y: '110%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ 
                                            duration: 0.8, 
                                            delay: 1.2 + (index * 0.06), 
                                            ease: [0.16, 1, 0.3, 1] 
                                        }}
                                        style={{
                                            fontFamily: "var(--sans)",
                                            fontSize: 'clamp(22px, 5vw, 32px)',
                                            fontWeight: '400',
                                            letterSpacing: '0.24em',
                                            color: '#d4a96a', 
                                            display: 'inline-block',
                                            textShadow: '0 2px 10px rgba(212,169,106,0.2)'
                                        }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </div>

                            {/* Underline separator */}
                            <motion.div 
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '220px', opacity: 0.8 }}
                                transition={{ duration: 1.2, delay: 2.4, ease: 'easeInOut' }}
                                style={{
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent, #d4a96a, #c9956d, transparent)'
                                }}
                            />

                            {/* Tagline */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 3.2, ease: 'easeOut' }}
                                style={{
                                    marginTop: '16px',
                                    fontSize: '9px',
                                    fontWeight: '500',
                                    letterSpacing: '0.45em',
                                    color: '#a1a1aa',
                                    textTransform: 'uppercase',
                                    textAlign: 'center'
                                }}
                            >
                                Timeless &nbsp;·&nbsp; Bold &nbsp;·&nbsp; Yours
                            </motion.div>
                        </div>
                        
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
