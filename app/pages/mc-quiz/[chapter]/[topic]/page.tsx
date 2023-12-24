'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentClass, KanjiContent, VocabContent, isKanjiContent, isVocabContent } from '@/app/utils/utils';
import './mc-quiz.css'
import MCOptions from '@/app/components/MCOptions/MCOptions';

function MCQuiz({ 
  params,
}: {
  params: { chapter: string, topic: string }
}) {
  const router = useRouter()
  const selectedChapterStr = decodeURI(params.chapter)
  const selectedTopicStr = decodeURI(params.topic)

  let hasSelectedIncorrect:boolean = false;

  const [contents, setContents] = useState<VocabContent[]|KanjiContent[]>([{japanese: 'Loading...', english: 'Loading...'}])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  // Gets the contents for given chapter and topic, and checks that they are defined
  useEffect(() => {
    // Fetch flashcard contents
    const fetchedContents = new ContentClass().get(selectedChapterStr, selectedTopicStr)

    // Check if contents are undefined
    if (fetchedContents === undefined) {
      alert('Error retrieving contents, returning to home page (you may need to press "ok" on this alert multiple times)')
      router.push('/')
    } else {
      const shuffledContents = shuffleArray(fetchedContents)

      // Update the state with shuffled contents
      setContents(shuffledContents as (VocabContent[] | KanjiContent[]))
    }
  }, [])

  // Shuffles the given array
  function shuffleArray(array:any[]):any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  }

  // Performs logic based on the option the user chose
  function handleOptionChosen(isCorrect: boolean) {
    // Option chosen is correct
    if (isCorrect) {
      if (currentIndex < contents.length) {
        setCurrentIndex(currentIndex+1)
        if (hasSelectedIncorrect) {
          hasSelectedIncorrect = false
        }
        else {
          setCorrectAnswers(correctAnswers+1)
        }
      }
      else {
        //TODO: implement when at the end of the game
        console.error('unimplemented')
      }
    }
    // Option chosen is incorrect
    else {
      hasSelectedIncorrect = true
    }    
  }


  // TODO: refactor or change to passing entire object
  function getQuizQuestion():string|undefined {
    if (isVocabContent(contents[0])) {
      return (contents[currentIndex] as VocabContent).japanese;
    } 
    else if (isKanjiContent(contents[0])) {
      return (contents[currentIndex] as KanjiContent).kanji;
    } 
    else {
      console.error('Error: unrecognized content type');
      console.trace();
      return 'Error';
    }
  }

  // TODO: refactor or change to passing entire object
  function getQuizOptions():{answer:string, others:string[]}|undefined {
    if (isVocabContent(contents[0])) {
      const othersArray: string[] = contents.map(obj => obj.english);

      if (currentIndex == contents.length - 1) {
        return (
          {answer: contents[currentIndex].english, others: othersArray.slice(0, currentIndex)}
        )
      }
      else {
        return (
          {answer: contents[currentIndex].english, others: [...othersArray.slice(0, currentIndex), ...othersArray.slice(currentIndex+1)]} 
        )
      }
    }
    else if (isKanjiContent(contents[0])) {
      const othersArray: string[] = contents.map(obj => obj.english);
      
      if (currentIndex == contents.length - 1) {
        return (
          {answer: contents[currentIndex].english, others: othersArray.slice(0, currentIndex)}
        )
      }
      else {
        return (
          {answer: contents[currentIndex].english, others: [...othersArray.slice(0, currentIndex), ...othersArray.slice(currentIndex+1)]} 
        )
      }
    }
    else {
      console.error('Error: unrecognized content type')
      console.trace()
      return undefined
    }
  }

  return (
    <main className='main-center'>
      <h1 className='text-5xl font-semibold'>
        Quiz
      </h1>
      <div className='centerArea'>
        <div className='flex bg-orange-200 justify-center items-center mb-20 w-96 h-52 px-10 py-7 rounded-lg text-2xl shadow-md'>
          {getQuizQuestion()}
        </div>
        <div className='flex justify-center items-center'>
          <MCOptions 
            onOptionChosen={handleOptionChosen}
            correctOption={getQuizOptions()?.answer || 'Error'}
            otherOptions={getQuizOptions()?.others || ['Error']}
          />
        </div>
        <div className='flex flex-col mt-10 items-center justify-center'>
          <p className='progressIndicator'>First-Time Correct Answers: {correctAnswers}</p>
          <p className='progressIndicator'>Progress: {currentIndex}/{contents.length}</p>
        </div>
      </div>
    </main>
  );
}

export default MCQuiz;