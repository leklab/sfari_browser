const path = require('path')

const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const ZYGOSITY_CATEGORIES = ['het', 'hom', 'hemi']

const resolveReads = async ({ readsDirectory, publicPath, meta }, { alt, chrom, pos, ref }) => {
  //const dbPath = path.join(readsDirectory, `all_variants_${meta}.chr${chrom}.db`)

  const dbPath = path.join(readsDirectory, `s18_gs10_gn2_gi0000_habfb8a837.chrM.db`)

  console.log("In resolveReads")
  console.log(dbPath)

  console.log("Opening db file")

  const db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  const rows = await db.all(
    'select combined_bamout_id, read_group_id, zygosity from variants where chrom = ? and pos = ? and ref = ? and alt = ?',
    chrom,
    pos,
    ref,
    alt
  )
  await db.close()

  console.log("Finish running query")
  console.log(rows)

  return rows.map(row => ({
    bamPath: `${publicPath}/${row.combined_bamout_id}.bam`,
    category: ZYGOSITY_CATEGORIES[row.zygosity - 1],
    indexPath: `${publicPath}/${row.combined_bamout_id}.bai`,
    readGroup: `${chrom}-${pos}-${ref}-${alt}-${row.zygosity}-${row.read_group_id}`,
  }))
}

module.exports = resolveReads
