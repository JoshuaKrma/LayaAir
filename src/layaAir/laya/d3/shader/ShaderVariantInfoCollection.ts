import { DefineDatas } from "./DefineDatas";
import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";
import { SubShader } from "./SubShader";

/**
 * 着色器变种。
 */
export class ShaderVariantInfo {
    /** @internal */
    _shader: Shader3D;
    /** @internal */
    _subShaderIndex: number = 0;
    /** @internal */
    _passIndex: number = 0;
    /** @internal */
    _defineNames: string[];

    /**
     * 创建着色器变种。
     * @param shader 着色器
     * @param subShaderIndex 子着色器索引 
     * @param passIndex 通道索引
     * @param defines 宏定义集合
     */
    constructor(shader: Shader3D, subShaderIndex: number, passIndex: number, defines: string[]) {
        this.setValue(shader, subShaderIndex, passIndex, defines);
    }

    /**
     * 给着色器变种赋值。
     * @param shader 着色器
     * @param subShaderIndex 子着色器索引 
     * @param passIndex 通道索引
     * @param defineNames 宏定义集合
     */
    setValue(shader: Shader3D, subShaderIndex: number, passIndex: number, defineNames: string[]): void {
        if (shader) {
            var subShader: SubShader = shader.getSubShaderAt(subShaderIndex);
            if (subShader) {
                var pass: ShaderPass = subShader._passes[passIndex];
                if (pass) {
                    var validDefine: DefineDatas = pass._validDefine;
                    for (var i: number = 0, n: number = defineNames.length; i < n; i++) {
                        var defname: string = defineNames[i];
                        if (!validDefine.has(Shader3D.getDefineByName(defname)))
                            throw `ShaderVariantInfo:Invalid defineName ${defname} in ${shader._name} subShaderIndex of ${subShaderIndex} passIndex of ${passIndex}.`;
                    }
                }
                else {
                    throw `ShaderVariantInfo:Shader don't have passIndex of ${passIndex}.`;
                }
            }
            else {
                throw `ShaderVariantInfo:Shader don't have subShaderIndex of ${subShaderIndex}.`;
            }
        }
        else {
            throw `ShaderVariantInfo:Shader can't be null.`;
        }
        this._shader = shader;
        this._subShaderIndex = subShaderIndex;
        this._passIndex = passIndex;
        this._defineNames = defineNames;
    }

    /**
     * 是否相等。
     * @param other 其它着色器变种
     * @return 是否相等。
     */
    equal(other: ShaderVariantInfo): boolean {
        if (this._shader !== other._shader || this._subShaderIndex !== other._subShaderIndex || this._passIndex !== other._passIndex) {
            return false;
        }
        else {
            var defines: string[] = this._defineNames;
            var otherDefines: string[] = other._defineNames;
            for (var i: number = 0, n: number = this._defineNames.length; i < n; i++) {
                if (defines[i] !== otherDefines[i])
                    return false;
            }
            return true;
        }
    }

    /**
     * 克隆。
     * @return 着色器变种。 
     */
    clone(): ShaderVariantInfo {
        var dest: ShaderVariantInfo = new ShaderVariantInfo(this._shader, this._subShaderIndex, this._passIndex, this._defineNames.slice());
        return dest;
    }
}

/**
 * 着色器变种集合。
 */
export class ShaderVariantInfoCollection {
    /** @internal */
    private _allCompiled: boolean = false;
    /** @internal */
    private _variants: ShaderVariantInfo[] = [];

    /**
     * 是否已经全部编译。
     */
    get allCompiled(): boolean {
        return this._allCompiled;
    }

    /**
     * 包含的变种数量。
     */
    get variantCount(): number {
        return this._variants.length;
    }

    /**
     * 添加着色器变种。
     * @param variant 着色器变种。
     * @param 是否添加成功。
     */
    add(variant: ShaderVariantInfo): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant))
                return false;
        }
        this._variants.push(variant.clone());
        this._allCompiled = false;
        return true;
    }

    /**
     * 移除着色器变种。
     * @param variant 着色器变种。
     * @return 是否移除成功。
     */
    remove(variant: ShaderVariantInfo): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant)) {
                this._variants.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * 是否包含着色器变种。
     * @param variant 着色器变种。
     */
    contatins(variant: ShaderVariantInfo): boolean {
        for (var i: number = 0, n: number = this._variants.length; i < n; i++) {
            if (this._variants[i].equal(variant))
                return true;
        }
        return false;
    }

    /**
     * 清空。
     */
    clear(): void {
        this._variants.length = 0;
    }

    /**
     * 执行编译。
     */
    compile(): void {
        if (!this._allCompiled) {
            var variants: ShaderVariantInfo[] = this._variants;
            for (var i: number = 0, n: number = variants.length; i < n; i++) {
                var variant: ShaderVariantInfo = variants[i];
                Shader3D.compileShaderByDefineNames(variant._shader._name, variant._subShaderIndex, variant._passIndex, variant._defineNames);
            }
            this._allCompiled = true;
        }
    }
}