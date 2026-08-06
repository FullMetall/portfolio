import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const config = await readFile(new URL("../deploy/nginx/container.conf", import.meta.url), "utf8");

test("container Nginx redirects nested trailing-slash routes to the canonical static-export URL", () => {
  assert.match(
    config,
    /location\s+~\s+\^\(\.\+\)\/\$\s*\{\s*absolute_redirect\s+off;\s*return\s+308\s+\$1\$is_args\$args;\s*\}/s,
  );
  assert.match(config, /location\s+\/\s*\{\s*try_files\s+\$uri\s+\$uri\.html\s+\$uri\/\s+=404;/s);
  assert.doesNotMatch(config, /return\s+30[18]\s+\$request_uri/);
});
