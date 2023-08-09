import { registerCustomIconComponent } from './components/customIcon'

/**
 * Custom Icon Plugin
 */
const plugin = fpAPI => {

    const { addFilter, utils } = fpAPI;
    const { Type, createRoute } = utils;

    // called for each view that is created right after the 'create' method
    addFilter('CREATE_VIEW', viewAPI => {

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
                    registerCustomIconComponent(item, root.element, iconList, onClickIcon);
                }
            }

        };

        // start writing
        view.registerWriter(
            createRoute({
                DID_LOAD_ITEM: didLoadItem
            }, ({ root, props }) => {
                const { id } = props;
                const item = query('GET_ITEM', id);

                // don't do anything while hidden
                if (root.rect.element.hidden) return;
            })
        );
    });

    // expose plugin
    return {
        options: {
            customIconList: [[], Type.ARRAY], // [{class: string, title: string, id: string}]
            onClickCustomIcon: [null, Type.FUNCTION],
            allowCustomIcon: [false, Type.BOOLEAN],
        }
    };
};

// fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
    document.dispatchEvent(new CustomEvent('FilePond:pluginloaded', { detail: plugin }));
}

export default plugin;
