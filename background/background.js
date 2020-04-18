let defaultWorkspaces = [
  { color: '#2f2f2f', tabs: [''], highlightedTab: 0 },
  { color: '#903216', tabs: [''], highlightedTab: 0 },
  { color: '#d24091', tabs: [''], highlightedTab: 0 },
  { color: '#7f8c8d', tabs: [''], highlightedTab: 0 },
  { color: '#e0e0e0', tabs: [''], highlightedTab: 0 },
  { color: '#7f40d2', tabs: [''], highlightedTab: 0 },
  { color: '#360f96', tabs: [''], highlightedTab: 0 },
  { color: '#c71a1c', tabs: [''], highlightedTab: 0 },
  { color: '#fe7511', tabs: [''], highlightedTab: 0 },
  { color: '#fadc10', tabs: [''], highlightedTab: 0 },
  { color: '#40d252', tabs: [''], highlightedTab: 0 },
  { color: '#3ce0de', tabs: [''], highlightedTab: 0 },
  { color: '#187efc', tabs: [''], highlightedTab: 0 },
  { color: '#1c18fc', tabs: [''], highlightedTab: 0 },
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
  chrome.tabs.query({}, (tabs) => {
    let tabURLs = []
    for (let i=0; i<tabs.length; i++) {
      let tab = tabs[i]
      tabURLs.push(tab.url)
      if (tab.highlighted) {
        workspaces[oldIndex].highlightedTab = i
      }
    }
    workspaces[oldIndex].tabs = tabURLs
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
  for (let i=0; i<ws.tabs.length; i++) {
    let tabURL = ws.tabs[i]
    let params = {}
    if (tabURL != '') {
      params['url'] = tabURL 
    }
    chrome.tabs.create(params)
  }
  setTimeout(() => {
    chrome.tabs.highlight({ tabs: ws.highlightedTab })
  }, 100)
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