# Development feed fixtures

These XML files are **synthetic**. They exist so the interface can be
developed and tested without outbound network access. Headlines, summaries
and URLs are invented and must never be treated as news.

Enable with:

    SIGNAL_FIXTURE_DIR=fixtures/dev-feeds npm run dev

The interface shows a "Development fixtures" badge whenever this mode is
active. It is never enabled by default.
