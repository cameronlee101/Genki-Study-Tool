import { Content } from '@/app/utils/utils'
import React from 'react'
import { getMCQuestionText } from '../MCQuiz-utils'

const MCQuestion = ( props: { content:Content }) => {
  const { content } = props

  return (<>
    <div 
      className='flex bg-orange-100 justify-center items-center rounded-lg text-2xl shadow-md
      sm:w-96 sm:h-52 sm:px-10 sm:py-7
      w-72 h-40'
    >
      <div dangerouslySetInnerHTML={{ __html: getMCQuestionText(content) }}></div>
    </div>
  </>)
}

export default MCQuestion