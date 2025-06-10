const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const dotenv = require("dotenv");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { fetchTotalCount, fetchAllPodcasts } = require("./services/podcastService");

dotenv.config();

const app = express();

const schema = buildSchema(`
  type PodcastImages {
    default: String
    featured: String
    thumbnail: String
    wide: String
  }
  
  type Podcast {
    id: ID
    title: String
    description: String
    categoryName: String
    publisherName: String
    images: PodcastImages
    isExclusive: Boolean
    hasFreeEpisodes: Boolean
    mediaType: String
  }
  
  type PodcastResponse {
    podcasts: [Podcast]
    totalItems: Int
    totalPages: Int
    currentPage: Int
  }
  
  type Query {
    podcasts(page: Int = 1, limit: Int = 10, search: String): PodcastResponse
  }
`);

const root = { //resolver
    podcasts: async ({ page = 1, limit = 10, search = "" }) => {
        try {
            const params = { page, limit, search };
            const [podcastsResponse, totalItems] = await Promise.all([
                fetchAllPodcasts(params),
                fetchTotalCount(search),
            ]);

            const totalPages = Math.ceil(totalItems / limit);

            return {
                podcasts: podcastsResponse,
                totalItems,
                totalPages,
                currentPage: page,
            };
        } catch (error) {
            //console.error("Error fetching podcasts:", error);
            throw new Error("Error fetching podcast data");
        }
    },
};


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per 15 minutes
    message: {
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
    },
    standardHeaders: true, // returns rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // personalize client identifiers
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || "unknown";
    },
    // Handler for rate limit exceeded
    handler: (req, res) => {
        //console.log(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: "Too many requests",
            message:
                "You have exceeded the rate limit. Please try again later.",
            retryAfter: Math.round(req.rateLimit.resetTime / 1000),
        });
    },
});

// Extrict rate limiting for GraphQL
const graphqlLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // max 50 GraphQL queries per 10 minutes
    message: {
        error: "Too many GraphQL queries from this IP, please try again later.",
        retryAfter: "10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for GraphiQL interface in development
        return (
            process.env.NODE_ENV === "development" &&
            req.headers["user-agent"]?.includes("Mozilla")
        );
    },
});

app.use(limiter);

// Manual CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "null", // for Files
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Middleware for handling GraphQL requests
app.get("/graphql", (req, res, next) => {
    // if no query and in development, skip
    if (!req.query.query && process.env.NODE_ENV === "development") {
        return next();
    }
    // if no query and not in development return error
    if (!req.query.query) {
        return res.status(400).json({
            error: "GraphQL endpoint requires a query",
            message:
                "Please provide a GraphQL query in the request body or query parameter",
        });
    }
    next();
});

app.use(
    "/graphql",
    graphqlLimiter, // apply rate limiting for GraphQL
    graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: process.env.NODE_ENV === "development", // Only enable GraphiQL in development
        // Use custom error formatter to log GraphQL errors instead of formatError (deprecated)
        customFormatErrorFn: (error) => {
            //console.error("GraphQL Error:", error);
            return {
                message: error.message,
                locations: error.locations,
                path: error.path,
            };
        },
    })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
    /*if (process.env.NODE_ENV === "development") {
        console.log(
            `GraphiQL interface available at http://localhost:${PORT}/graphql`
        );
    }*/
});