// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
"use strict";

const TEST_SENTENCE = "hello@world.io\n"   

const random = (min = 1e2, max = 5e2) => 
  (Math.random() * (max - min) + min).toFixed()

const rawKeyGenerator = key => {
  if(!key || key.length !== 1) return  {}

  let keyMapper = {
    'modifiers': 0,
    'text': key,
    'unmodifiedText': key,
    'key': key,
    'windowsVirtualKeyCode': key.charCodeAt(0),
    'nativeVirtualKeyCode': key.charCodeAt(0),
    'macCharCode': key.charCodeAt(0),
    'type': 'keyDown'
  }

  const special = {
    '.': () => {
      keyMapper['windowsVirtualKeyCode'] = 190
      keyMapper['nativeVirtualKeyCode'] = 190
      keyMapper['macCharCode'] = 190
    },
    '\n': () => {
      keyMapper = {
        'modifiers': 0,
        'windowsVirtualKeyCode': 13,
        'nativeVirtualKeyCode': 13,
        'macCharCode': 13,
        'type': 'keyDown'
      }
    }
  }

  if(special.hasOwnProperty(key)) special[key]()

  return keyMapper
}

const charType = (char, tab) => {
  chrome.debugger.sendCommand(
    { tabId: tab.id }, 'Input.dispatchKeyEvent', rawKeyGenerator(char)
  )
}

const humanType = (sentence, tab) => {
  if(!sentence.length) return

  setTimeout(() => {
    charType(sentence.charAt(), tab)
    humanType(sentence.slice(1), tab)
  }, random())
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes("chrome://")) {
      try {
          chrome.debugger.attach({ tabId: tab.id }, "1.2", function () {
              humanType(TEST_SENTENCE, tab)
              charType('<ENTER>', tab)
          })
      } catch (e) {
          console.log("e", e)
      }
  }
})
