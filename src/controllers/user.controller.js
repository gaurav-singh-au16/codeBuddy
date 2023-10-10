const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .skip(skip)
      .limit(limit);

    const userIds = users.map((user) => user._id);

    const postCounts = await Post.aggregate([
      {
        $match: { userId: { $in: userIds } }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      }
    ]);

    
    const postCountMap = new Map();
    postCounts.forEach((result) => {
      postCountMap.set(result._id.toString(), result.count);
    });


    const userDataWithCounts = users.map((user) => ({
      _id: user._id,
      name: user.name,
      posts: postCountMap.get(user._id.toString()) || 0,
    }));


    const totalDocs = await User.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);
    const pagingCounter = ((page - 1) * limit) + 1
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const result = {
      data: {
        users: userDataWithCounts,
        pagination: {
          totalDocs,
          limit,
          page,
          totalPages,
          pagingCounter,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
        },
      },
    };

    // console.log(result);
    res.status(200).json((result));

  } catch (error) {
    res.send({ error: error.message });
  }
};
