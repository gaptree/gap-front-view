import {Div, Ul} from '../index.js';

test('view', () => {
    const div = new Div();
    div.appendTo(document.body);
    expect(document.body.innerHTML).toBe('<div></div>');

    const ul = new Ul();
    ul.appendTo(document.body);
    expect(document.body.innerHTML)
        .toBe('<div></div><ul></ul>');
});
