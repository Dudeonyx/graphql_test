import express from 'express';

import { graphqlHTTP } from 'express-graphql';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  buildSchema,
} from 'graphql';

const app = express();

const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' },
];

const books = [
  { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, name: 'The Two Towers', authorId: 2 },
  { id: 6, name: 'The Return of the King', authorId: 2 },
  { id: 7, name: 'The Way of Shadows', authorId: 3 },
  { id: 8, name: 'Beyond the Shadows', authorId: 3 },
];

const BookType: GraphQLObjectType<{
  id: number;
  name: string;
  authorId: number;
  author: typeof AuthorType;
}> = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => authors.find((author) => author.id === book.authorId),
    },
  }),
});

const AuthorType: GraphQLObjectType<{ id: number; name: string; books: typeof BookType[] }> =
  new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      books: {
        type: GraphQLList(BookType),
        resolve: (author) => books.filter((book) => book.authorId === author.id),
      },
    }),
  });

const RootQueryType: GraphQLObjectType<{
  books: typeof BookType[];
  authors: typeof AuthorType[];
  book: typeof BookType;
  author: typeof AuthorType;
}> = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    books: {
      type: GraphQLList(BookType),
      description: 'A list of all books',
      resolve: () => books,
    },
    authors: {
      type: GraphQLList(AuthorType),
      description: 'A list of all authors',
      resolve: () => authors,
    },
    book: {
      type: BookType,
      description: 'A single book',
      args: { id: { type: GraphQLInt } },
      resolve: (_, args) => books.find((book) => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: 'A single author',
      args: { id: { type: GraphQLInt } },
      resolve: (_, args) => authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Adds a single book to the list of books',
      args: {
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const book = { id: books.length + 1, authorId: args.authorId, name: args.name };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Adds a single author to the list of authors',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const author = { id: authors.length + 1, name: args.name };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const schema2 = buildSchema(`

type Book {
    id: Int!
    name: String!
    authorId: Int!
    t: Int!
    author: Author
}

type Author {
    id: Int!
    name: String!
    books: [Book]
}

type Query {
    books: [Book]
    authors: [Author]
}

`);

const root = {
  books: () => books,
  authors: () => authors,
};

app.use(
  '/graphql',
  graphqlHTTP({
    graphiql: true,
    schema: schema,
    // rootValue: root,
  }),
);

app.listen(5000, () => console.log('listening on port 5000'));
