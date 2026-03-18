'use client'

import Lottie from 'lottie-react'
import { useState } from 'react'

import introAnimation from '../../public/animations/intro-Playful.json'
import homeAnimation from '../../public/animations/Home-Playful.json'

type Phase = 'intro' | 'home'

interface SplashScreenProps {
    onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {

    const [phase, setPhase] = useState<Phase>('intro')
    const [fadeOut, setFadeOut] = useState(false)

    const handleHomeComplete = () => {
        setFadeOut(true)
        setTimeout(onFinish, 600)
    }

    return (
        <div
            className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-white
        transition-opacity duration-[600ms]
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
        >

            {/* INTRO */}
            {phase === 'intro' && (
                <Lottie
                    animationData={introAnimation}
                    loop={false}
                    onComplete={() => setPhase('home')}
                    className="w-full h-auto"
                />
            )}

            {/* HOME */}
            {phase === 'home' && (
                <Lottie
                    animationData={homeAnimation}
                    loop={false}
                    onComplete={handleHomeComplete}
                    className="w-full h-auto"
                />
            )}

        </div>
    )
}