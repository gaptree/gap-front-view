import {BinderBase} from './BinderBase';

export class ViewPropBinder extends BinderBase {
    constructor(viewBinder, prop) {
        super();

        this.viewBinder = viewBinder;
        this.prop = prop;
    }

    update(val) {
        this.viewBinder.updateProp(this.prop, val);
    }
}
