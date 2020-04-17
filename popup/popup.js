let workspacesListElem = document.getElementById('workspacesList')
let workspaces, currentWorkspace

chrome.runtime.sendMessage({functionName: "getWorkspaces"}, data => {
  workspaces = data.workspaces
  currentWorkspace = data.currentWorkspace
  initWorkspacesList()
});

function initWorkspacesList() {
  for (let i=0; i<workspaces.length; i++) {
    let ws = workspaces[i]
    let li = document.createElement('li')
    li.style.backgroundColor = ws.color

    if (i == currentWorkspace) {
      li.className = 'current'
    } else {
      li.addEventListener('click', () => {
        switchToWorkspace(i)
      })
    }
    
    workspacesListElem.appendChild(li)
  }
}

function switchToWorkspace(i) {
  chrome.runtime.sendMessage({
    functionName: "switchToWorkspace",
    index: i
  })
}
