import {View} from '../index';

class PremiumView extends View {
    template() {
        return this.html`
        <span class="premium">
            $${'name'}
        </span>
        `;
    }
}

class BookView extends View {
    template() {
        return this.html`
        <span>$${'book.title'}</span>
        <div trigger="book.author">
            ${author => this.getAuthorTemplate(author)}
        </div>
        `;
    }

    setAuthor(author) {
        this.data.book.author = author;
    }

    getAuthorTemplate(author) {
        if (author.rank === 'new') {
            return 'new author - ' + author.name;
        }

        if (author.rank === 'premium') {
            return this.html`
            <gap-view
                view=${new PremiumView()}
                bind="book.author"
            ></gap-view>
            `;
        }

        return this.html`
        <span class="normal">
            $${'book.author.name'}
        </span>
        `;
    }
}

test('trigger', () => {
    const bookView = new BookView();
    bookView.appendTo(document.body);

    bookView.update({
        book: {
            title: 'book title',
            author: {
                name: 'mike'
            }
        }
    });

    expect(document.body.innerHTML.trim())
        .toBe('<span>book title</span> <div><span class="normal"> mike </span></div>');

    bookView.setAuthor({
        rank: 'new',
        name: 'jack'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<span>book title</span> <div>new author - jack</div>');

    bookView.setAuthor({
        rank: 'premium',
        name: 'super sum'
    });

    expect(document.body.innerHTML.trim())
        .toBe('<span>book title</span> <div><span class="premium"> super sum </span></div>');
});
