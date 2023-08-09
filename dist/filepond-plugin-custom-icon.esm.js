/*!
 * FilePondPluginCustomIcon 1.0.0
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit undefined for details.
 */

/* eslint-disable */

/**
 * Register the download component by inserting the download icon
 */
const registerCustomIconComponent = (item, el, iconList, onClickFunc) => {
  const info = el.querySelector('.filepond--file-info');
  const mainInfo = el.querySelector('.filepond--file-info-main');
  const _iconList = getIconList(iconList);

  if (_iconList.length) {
    let container = el.querySelector('.filepond--file-info-main-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'filepond--file-info-main-container';
      container.append(mainInfo);
      info.prepend(container);
    }

    _iconList.forEach((val) => {
      let icon = document.createElement('span');
      icon.className = 'filepond--custom-icon ' + val.class;
      if (val.title) {
        icon.title = val.title;
      }
      if (val.id) {
        icon.dataset.id = val.id;
      }
      icon.addEventListener('click', () => {
        onClickFunc && onClickFunc(item, val, icon);
      });
      container.prepend(icon);
    });
  }
};

/**
 * Generates the download icon
 */
const getIconList = (iconList) => {
  if (Array.isArray(iconList)) {
    return iconList.map((val) => {
      if (val.class && val.class.length) {
        return val;
      }
    });
  }
  return [];
};

/**
 * Triggers the actual download of the uploaded file
 */
const downloadFile = (item, allowDownloadByUrl, downloadFunction) => {
  if (downloadFunction && typeof downloadFunction === 'function') {
    downloadFunction(item);
    return;
  }
  // if client want to download file from remote server
  if (allowDownloadByUrl && item.getMetadata('url')) {
    location.href = item.getMetadata('url'); // full path to remote server is stored in metadata with key 'url'
  } else {
    // create a temporary hyperlink to force the browser to download the file
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(item.file);
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = item.file.name;
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();
  }
};

/**
 * Custom Icon Plugin
 */
const plugin = (fpAPI) => {
  const { addFilter, utils } = fpAPI;
  const { Type, createRoute } = utils;

  // called for each view that is created right after the 'create' method
  addFilter('CREATE_VIEW', (viewAPI) => {
    // get reference to created view
    const { is, view, query } = viewAPI;

    // only hook up to item view
    if (!is('file')) {
      return;
    }

    // create the plugin
    const didLoadItem = ({ root, props }) => {
      const { id } = props;
      const item = query('GET_ITEM', id);

      if (!item || item.archived) {
        return;
      }

      const allowCustomIcon = root.query('GET_ALLOW_CUSTOM_ICON');

      if (allowCustomIcon) {
        const iconList = root.query('GET_CUSTOM_ICON_LIST');

        if (iconList && iconList.length) {
          const onClickIcon = root.query('GET_ON_CLICK_CUSTOM_ICON');
          registerCustomIconComponent(
            item,
            root.element,
            iconList,
            onClickIcon
          );
        }
      }
    };

    // start writing
    view.registerWriter(
      createRoute(
        {
          DID_LOAD_ITEM: didLoadItem,
        },
        ({ root, props }) => {
          const { id } = props;
          const item = query('GET_ITEM', id);

          // don't do anything while hidden
          if (root.rect.element.hidden) return;
        }
      )
    );
  });

  // expose plugin
  return {
    options: {
      customIconList: [[], Type.ARRAY], // [{class: string, title: string, id: string}]
      onClickCustomIcon: [null, Type.FUNCTION],
      allowCustomIcon: [false, Type.BOOLEAN],
    },
  };
};

// fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags
const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin })
  );
}

export { plugin as default };
