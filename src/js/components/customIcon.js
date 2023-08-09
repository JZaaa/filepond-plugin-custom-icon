/**
 * Register the download component by inserting the download icon
 */
export const registerCustomIconComponent = (item, el, iconList, onClickFunc) => {
  const info = el.querySelector('.filepond--file-info')
  const mainInfo = el.querySelector('.filepond--file-info-main')
  const _iconList = getIconList(iconList)

  if (_iconList.length) {
    let container = el.querySelector('.filepond--file-info-main-container')
    if (!container) {
      container = document.createElement('div')
      container.className = 'filepond--file-info-main-container'
      container.append(mainInfo)
      info.prepend(container)
    }

    _iconList.forEach(val => {
      let icon = document.createElement('span')
      icon.className = 'filepond--custom-icon ' + val.class
      if (val.title) {
        icon.title = val.title
      }
      if (val.id) {
        icon.dataset.id = val.id
      }
      icon.addEventListener("click", () => {
        onClickFunc && onClickFunc(item, val, icon)
      })
      container.prepend(icon)
    })
  }
}

/**
 * Generates the download icon
 */
export const getIconList = (iconList) => {
  if (Array.isArray(iconList)) {
    return iconList.map(val => {
      if (val.class && val.class.length) {
        return val
      }
    })
  }
  return []
}

/**
 * Triggers the actual download of the uploaded file
 */
export const downloadFile = (item, allowDownloadByUrl, downloadFunction) => {
  if (downloadFunction && typeof downloadFunction === 'function') {
    downloadFunction(item);
    return;
  }
  // if client want to download file from remote server
  if (allowDownloadByUrl && item.getMetadata('url')) {
    location.href = item.getMetadata('url'); // full path to remote server is stored in metadata with key 'url'
  } else {
    // create a temporary hyperlink to force the browser to download the file
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(item.file);
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = item.file.name;
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
