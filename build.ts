import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  outfile: "dist/index.cjs",

  external: [
    "@actions/core",
    "@actions/github"
  ],

  format: "cjs",
  minify: true
});