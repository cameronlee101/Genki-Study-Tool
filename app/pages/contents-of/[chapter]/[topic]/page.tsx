'use client'
import { ContentClass, KanjiContent, VocabContent, getExampleFullObject } from "@/app/utils/utils"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import styles from './styles-of.module.css'

function ContentsOf({ 
  params,
}: {
  params: { chapter: string, topic: string }
}) {
  const router = useRouter()
  const selectedChapterStr = decodeURI(params.chapter)
  const selectedTopicStr = decodeURI(params.topic)

  const [contents, setContents] = useState<VocabContent[]|KanjiContent[]>([{japanese: 'Loading...', english: 'Loading...'}])

  // Gets the contents for given chapter and topic, and checks that they are defined
  useEffect(() => {
    // Fetch flashcard contents
    const fetchedContents = new ContentClass().get(selectedChapterStr, selectedTopicStr)

    // Check if contents are undefined
    if (fetchedContents === undefined) {
      alert('Error retrieving contents, returning to home page (you may need to press "ok" on this alert multiple times)')
      router.push('/')
    }
    else {
      setContents(fetchedContents as (VocabContent[] | KanjiContent[]))
    }
  }, [])

  // Extracts parameters names from an example object for the table headers
  let allParameters = ['']
  if (getExampleFullObject(contents[0])) {
    if (getExampleFullObject(contents[0])) {
      allParameters = Object.keys(getExampleFullObject(contents[0])!)
    }
    else {
      console.error('Error occurred when retrieving example object containing all attributes')
      console.trace()
    }
  }

  return (
    <main className='main-center'>
      <h1 className='text-5xl font-semibold mb-8'>Contents of {selectedChapterStr} {selectedTopicStr}</h1>
      <table className='table table-striped-columns table-hover table-bordered table-sm'>
        <thead >
          <tr>
            {allParameters.map((parameter, index) => (
              <th 
                key={index}
                className={styles.th}
              >
                {parameter.charAt(0).toUpperCase() + parameter.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='table-group-divider'>
          {contents.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {allParameters.map((parameter, columnIndex) => (
                <td key={columnIndex} className='whitespace-pre'>
                  {Array.isArray(item[parameter])
                  ? (item[parameter] as string[]).join(',   ') 
                  : item[parameter] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default ContentsOf;