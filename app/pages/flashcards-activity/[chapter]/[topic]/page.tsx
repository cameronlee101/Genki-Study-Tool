'use client'
import React, { useEffect, useState } from 'react'
import { ContentClass, VocabFlashcardContent } from "@/app/utils/utils"
import Flashcard from '@/app/components/Flashcard/Flashcard'
import styles from './FlashcardsActivity.module.css'
import { FaArrowCircleLeft, FaArrowCircleRight  } from "react-icons/fa"
import { useRouter } from 'next/navigation'

const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';
const COOLDOWN_DURATION = 600

function FlashcardsActivity({ 
  params,
}: {
  params: { chapter: string, topic: string }
}) {
  const router = useRouter()
  const selectedChapterStr = params.chapter.replaceAll('%20', ' ')
  const selectedTopicStr = params.topic.replaceAll('%20', ' ')

  const [animationClass, setAnimationClass] = useState('')
  const [enableInput, setEnableInput] = useState(true)
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [flashcardContents, setFlashcardContents] = useState<VocabFlashcardContent[]|undefined>([{japanese: 'Loading...', english: 'Loading...'}])

  // Gets the flashcard contents, checks that they are defined, then shuffles the elements
  useEffect(() => {
    // Fetch flashcard contents
    const fetchedContents = new ContentClass().get(selectedChapterStr, selectedTopicStr)

    // Check if contents are undefined
    if (fetchedContents === undefined) {
      alert('Error retrieving flashcard contents, returning to home page (you may need to press "ok" on this alert multiple times)')
      router.push('/')
    } else {
      // Shuffle the contents
      const shuffledContents = [...fetchedContents]
      for (let i = shuffledContents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledContents[i], shuffledContents[j]] = [shuffledContents[j], shuffledContents[i]]
      }

      // Update the state with shuffled contents
      setFlashcardContents(shuffledContents)
    }
  }, [])

  // Creates keypress event listener on the window which uses the enableInput and lastKeyPressTime states
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key == ARROW_LEFT) {
        flashcardLeft()
      }
      else if (event.key == ARROW_RIGHT) {
        flashcardRight()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [enableInput, lastKeyPressTime])

  // Run this effect whenever enableInput or direction states change
  useEffect(() => {
    if (enableInput && (direction === 'left' || direction === 'right')) {
      // Disable input for a time and assign the animation class to the flashcard to animate it moving
      setEnableInput(false);
      setLastKeyPressTime(Date.now());
      setDirection(null);

      if (direction === 'left') {
        setAnimationClass(styles.moveLeft)
      }
      else if (direction === 'right') {
        setAnimationClass(styles.moveRight)
      }
      
      // Creates timeout that changes the flashcard's contents when it is off the screen during its animation
      setTimeout(() => {
        if (direction === 'left') {
          setCurrentIndex((currentIndex + 1) % flashcardContents!.length);
        } else if (direction === 'right') {
          setCurrentIndex(currentIndex === 0 ? flashcardContents!.length - 1 : currentIndex - 1);
        }
      }, COOLDOWN_DURATION / 2);
    }
  }, [enableInput, direction]);

  const flashcardLeft = () => {
    // If enough time has passed, allow input and queue the flashcards to move left (which will execute in useEffect)
    if (Date.now() - lastKeyPressTime >= COOLDOWN_DURATION) {
      setEnableInput(true)
      setAnimationClass('')
      setDirection('right')
    }
  }

  const flashcardRight = () => {
    // If enough time has passed, allow input and queue the flashcards to move right (which will execute in useEffect)
    if (Date.now() - lastKeyPressTime >= COOLDOWN_DURATION) {
      setEnableInput(true)
      setAnimationClass('')
      setDirection('left')
    }
  }

  return (    
    <main className={`main-center ${styles.main}`}>
      <h1 className='text-5xl font-semibold'>{selectedChapterStr} {selectedTopicStr} Flashcards</h1>
      <div className={styles.flashcardArea}>
        <div className={animationClass}>
          <Flashcard contents={flashcardContents![currentIndex]}></Flashcard>
        </div>
        <div className='flex justify-center mt-10'>
          <FaArrowCircleLeft className={styles.flashcardButton} onClick={flashcardLeft}/>
          <FaArrowCircleRight className={styles.flashcardButton} onClick={flashcardRight}/>
        </div>
        <p className='mt-10 text-2xl font-semibold'>{currentIndex+1}/{flashcardContents!.length}</p>
      </div>
    </main>
  )
}

export default FlashcardsActivity