'use client';
import React, { useEffect, useRef, useState } from 'react';
import './Flashcard.css';
import { KanjiContent, VocabContent, isKanjiContent, isVocabContent } from '@/app/utils/utils';
import { useRouter } from 'next/navigation'

const SPACE = ' '
const COOLDOWN_DURATION = 300

const Flashcard = (props: { contents:VocabContent|KanjiContent }) => {
  const { contents } = props

  const router = useRouter()

  const [isFlipped, setIsFlipped] = useState(false)
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0)
  const [flippingCard, setFlippingCard] = useState(false)

  const flashcardFrontRef = useRef<HTMLDivElement>(null);
  const flashcardBackRef = useRef<HTMLDivElement>(null);

  // Changes how content is justified on flashcard when props for flashcard changes (start when there is overflow, center when there isn't)
  useEffect(() => {
    const handleOverflow = () => {
      const front = flashcardFrontRef.current
      if (front) {
        const hasOverflow = front.scrollHeight > front.clientHeight;
        front.style.justifyContent = hasOverflow ? 'start' : 'center';
      }
      const back = flashcardBackRef.current
      if (back) {
        const hasOverflow = back.scrollHeight > back.clientHeight;
        back.style.justifyContent = hasOverflow ? 'start' : 'center';
      }
    };

    // Initial check
    handleOverflow(); 

    // Attach event listener for dynamic changes
    window.addEventListener('resize', handleOverflow);

    return () => {
      window.removeEventListener('resize', handleOverflow);
    };
  }, [props]);

  // Creates keypress event listener on the window which uses the enableInput and lastKeyPressTime states
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key == SPACE) {
        handleFlip()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [lastKeyPressTime])

  // Run this effect whenever flippingCard state changes
  useEffect(() => {
    if (flippingCard) {
      // Disable input for a time and flip the flashcard
      setLastKeyPressTime(Date.now());
      setFlippingCard(false)
      setIsFlipped(!isFlipped)
    }
  }, [flippingCard]);

  const handleFlip = () => {
    // If enough time has passed since the last card flip, queue the flashcard to flip (which will execute in useEffect)
    if (Date.now() - lastKeyPressTime >= COOLDOWN_DURATION) {
      setFlippingCard(true)
    }
  };

  if (isVocabContent(contents)) {
    const data = contents as VocabContent
    return (
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div ref={flashcardFrontRef} className='front'>
          {data.japanese}{data.alternate && ('/' + data.alternate)} {data.kanji && ('(' + data.kanji + ')')}
        </div>
        <div ref={flashcardBackRef} className='back'>
          {data.english}{data.example && (', ex. ' + data.example)}
        </div>
      </div>
    );
  }
  else if (isKanjiContent(contents)) {
    const data = contents as KanjiContent
    return (
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div ref={flashcardFrontRef} className='front'>
          {data.kanji}
        </div>
        <div ref={flashcardBackRef} className='back'>
          <div>
            <span className='font-semibold'>Meaning</span>: {data.english}
          </div>
          <div>
            <span className='font-semibold'>Readings</span>: {data.readings.join(', ')}
          </div>
          <div>
            <span className='font-semibold'>Examples</span>: <br/>
            {data.examples.map((example) => (
              <span key={example}>{example}<br/></span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  else {
    alert('Error occurred when confirming type of flashcard contents, returning to home page (you may need to press "ok" on this alert multiple times)')
    router.push('/')
  }
};

export default Flashcard;
