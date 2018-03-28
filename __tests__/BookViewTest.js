import {BookView} from '../__lib__/BookView.js';

test('BookView', () => {
    const book = new BookView();
    book.appendTo(document.body);


    expect(document.body.innerHTML)
        .toBe('<p><span class="user"> <strong>miao</strong> </span></p>');

    book.update();
    expect(document.body.innerHTML)
        .toBe('<p><span class="user"> <strong>haha</strong> </span></p>');
});
