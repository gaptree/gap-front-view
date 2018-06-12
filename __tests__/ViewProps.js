import {View} from '../index';

class UserView extends View {
    constructor(props) {
        super(props);

        this.update({
            userId: 'defaultId',
            nick: 'defaultNick'
        });
    }

    template() {
        return this.html`
        <div>
            <h1>${this.props.title}</h1>
            $${'userId'} - $${'nick'}
        </div>
        `;
    }

    setNick(nick) {
        this.data.nick = nick;
    }
}

test('view props', () => {
    const userView = new UserView({title: 'User View'});
    userView.appendTo(document.body);

    expect(document.body.innerHTML)
        .toBe('<div> <h1>User View</h1> defaultId - defaultNick </div>');

    userView.update({
        userId: 'id1',
        nick: 'tom'
    });

    userView.appendTo(document.body);

    expect(document.body.innerHTML)
        .toBe('<div> <h1>User View</h1> id1 - tom </div>');

    userView.setNick('sum');

    expect(document.body.innerHTML)
        .toBe('<div> <h1>User View</h1> id1 - sum </div>');
});
