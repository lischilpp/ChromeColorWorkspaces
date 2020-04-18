let defaultWorkspaces = [
  { color: '#2f2f2f', tabs: [''] },
  { color: '#903216', tabs: [''] },
  { color: '#d24091', tabs: [''] },
  { color: '#7f8c8d', tabs: [''] },
  { color: '#e0e0e0', tabs: [''] },
  { color: '#7f40d2', tabs: [''] },
  { color: '#360f96', tabs: [''] },
  { color: '#c71a1c', tabs: [''] },
  { color: '#fe7511', tabs: [''] },
  { color: '#fadc10', tabs: [''] },
  { color: '#40d252', tabs: [''] },
  { color: '#3ce0de', tabs: [''] },
  { color: '#187efc', tabs: [''] },
  { color: '#1c18fc', tabs: [''] },
]

let workspaces, currentWorkspace

chrome.storage.local.get('workspaces', (result) => {
  if (typeof result.workspaces == 'undefined') {
    workspaces = defaultWorkspaces
    chrome.storage.local.set({dict: defaultWorkspaces})
  } else {
    workspaces = result.workspaces
  }
  chrome.storage.local.get('currentWorkspace', (result) => {
    if (typeof result.currentWorkspace == 'undefined') {
      currentWorkspace = 0
      chrome.storage.local.set({currentWorkspace: 0})
    } else {
      currentWorkspace = result.currentWorkspace
    }
    setCurrentWorkspaceColor()
  })
})

function setCurrentWorkspaceColor() {
  for (let i=0; i<workspaces.length; i++) {
    let ws = workspaces[i]
    if (i == currentWorkspace) {
      setBrowserIconColor(ws.color)
    }
  }
}

function switchToWorkspace(i) {
  saveOpenTabs(currentWorkspace, oldTabs => {
    currentWorkspace = i
    let ws = workspaces[i]
    setBrowserIconColor(ws.color)
    chrome.storage.local.set({currentWorkspace: i})
    loadNewTabs()
    removeTabs(oldTabs)
  })
}

function saveOpenTabs(oldIndex, callback) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    workspaces[oldIndex].tabs = tabs.map(tab => tab.url)
    chrome.storage.local.set({workspaces})
    let oldTabs = tabs.map(tab => tab.id)
    if (typeof callback !== 'undefined') callback(oldTabs)
  })
}

function removeTabs(tabs) {
  for (let tab of tabs) {
    chrome.tabs.remove(tab)
  }
}

function loadNewTabs() {
  let ws = workspaces[currentWorkspace]
  for (let tabURL of ws.tabs) {
    if (tabURL == '') {
      chrome.tabs.create({})
    } else {
      chrome.tabs.create({ url: tabURL })
    }
  }
}

function setBrowserIconColor(color) {
  let can = document.createElement('canvas')
  can.width = 1
  can.height = 1
  let ctx = can.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)

  chrome.browserAction.setIcon({imageData:ctx.getImageData(0, 0, 1, 1)})
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.functionName) {
      case "getWorkspaces":
        sendResponse({workspaces, currentWorkspace})
      break
      case "switchToWorkspace":
        switchToWorkspace(request.index)
      break
  }
});