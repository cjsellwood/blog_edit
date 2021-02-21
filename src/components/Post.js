import React from "react";
import "./Post.css";
import { useParams } from "react-router-dom";

const Post = (props) => {
  // const [post, setPost] = useState({});
  const { id } = useParams();

  const filteredPost = props.posts.filter((el) => {
    return el._id === id;
  })[0];

  let comments = null;
  if (typeof filteredPost.title !== "undefined") {
    comments = filteredPost.comments.map((comment) => {
      return (
        <li key={comment._id}>
          <p>{comment.username}</p>
          <p className="date">{new Date(comment.date).toLocaleDateString()}</p>
          <p className="comment-text">{comment.text}</p>
        </li>
      );
    });
  }

  return (
    <div className="Post">
      <h1 className="title">{filteredPost.title}</h1>
      <p className="date">{new Date(filteredPost.date).toLocaleDateString()}</p>
      <p>{filteredPost.text}</p>
      <h2 className="comment-title">Comments</h2>
      <ol className="comment-list">{comments}</ol>
      <form onSubmit={props.addComment} method="POST" data-id={id} className="form">
      <h3>Add Comment</h3>
        <div>
          <label htmlFor="username">Username</label>
          <input
            onChange={props.handleInput}
            type="text"
            name="username"
            placeholder="username"
            id="username"
            value={props.comment.username}
            required
          />
        </div>
        <div>
          <label htmlFor="text">Comment</label>
          <textarea
            onChange={props.handleInput}
            id="text"
            name="text"
            placeholder="Comment"
            value={props.comment.text}
            required
            rows="5"
          ></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Post;
